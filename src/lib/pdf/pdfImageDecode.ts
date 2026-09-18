import {
  PDFArray,
  PDFContext,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRawStream,
  PDFRef,
  PDFStream,
} from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Next.js/Turbopack doesn't support Vite's `?url` import suffix, so the
// worker script is resolved via the standard `new URL(..., import.meta.url)`
// pattern instead, which both bundlers understand and which pdfjs-dist's own
// docs recommend for non-Vite setups.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// PDF user space maxes out at 14400 units; keep the scratch page inside that.
const MAX_PAGE_UNITS = 14000;

/**
 * Deep-copy a PDF object from one context into another, following indirect
 * references. pdf-lib's own PDFObjectCopier only chases refs that sit
 * directly in a dictionary, so it drops ones nested inside e.g. an
 * `/ColorSpace [/Indexed /DeviceRGB 255 7 0 R]` array — exactly the images
 * this module cares about.
 */
function deepCopy(object: unknown, src: PDFContext, dest: PDFContext, seen: Map<string, PDFRef>): unknown {
  if (object instanceof PDFRef) {
    const key = object.tag;
    const existing = seen.get(key);
    if (existing) return existing;
    const ref = dest.nextRef();
    seen.set(key, ref);
    const value = src.lookup(object);
    if (value) dest.assign(ref, deepCopy(value, src, dest, seen) as never);
    return ref;
  }
  if (object instanceof PDFStream) {
    const dict = deepCopy(object.dict, src, dest, seen) as PDFDict;
    return PDFRawStream.of(dict, object.getContents());
  }
  if (object instanceof PDFDict) {
    const copy = PDFDict.withContext(dest);
    for (const [key, value] of object.entries()) {
      copy.set(key, deepCopy(value, src, dest, seen) as never);
    }
    return copy;
  }
  if (object instanceof PDFArray) {
    const copy = PDFArray.withContext(dest);
    for (const value of object.asArray()) copy.push(deepCopy(value, src, dest, seen) as never);
    return copy;
  }
  return object;
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

/**
 * Wrap a single image XObject in a throwaway one-page PDF, so PDF.js can be
 * used to decode it — this offloads every exotic filter/colour-space case
 * (JPEG 2000, CCITT fax, indexed palettes, CMYK, ICC-based, etc.) to a
 * renderer that already knows how to handle them, instead of hand-rolling
 * decoders here.
 */
async function wrapImageInPdf(
  stream: PDFStream,
  srcContext: PDFContext,
  width: number,
  height: number,
): Promise<{ bytes: Uint8Array; pageWidth: number }> {
  const scratch = await PDFDocument.create();
  const dest = scratch.context;

  const copied = deepCopy(stream, srcContext, dest, new Map()) as PDFStream;
  copied.dict.delete(PDFName.of("SMask"));
  copied.dict.delete(PDFName.of("Mask"));
  const imageRef = dest.register(copied);

  const scale = Math.min(1, MAX_PAGE_UNITS / Math.max(width, height));
  const pageWidth = Math.max(1, width * scale);
  const pageHeight = Math.max(1, height * scale);

  const page = scratch.addPage([pageWidth, pageHeight]);
  page.node.setXObject(PDFName.of("Im0"), imageRef);
  const contents = dest.flateStream(`q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q`);
  page.node.set(PDFName.of("Contents"), dest.register(contents));

  return { bytes: await scratch.save({ useObjectStreams: false }), pageWidth };
}

export async function decodeWithPdfjs(
  stream: PDFStream,
  srcContext: PDFContext,
  width: number,
  height: number,
  targetWidth: number,
  targetHeight: number,
): Promise<HTMLCanvasElement> {
  const { bytes, pageWidth } = await wrapImageInPdf(stream, srcContext, width, height);
  // `destroy()` lives on the loading task, not on the resolved PDFDocumentProxy
  // (pdfjs-dist 6.x) — the task must be kept around so it can be torn down.
  const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
  try {
    const doc = await loadingTask.promise;
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: targetWidth / pageWidth });
    const canvas = makeCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    return canvas;
  } finally {
    await loadingTask.destroy();
  }
}

export async function decodeWithBrowser(
  contents: Uint8Array,
  targetWidth: number,
  targetHeight: number,
): Promise<HTMLCanvasElement> {
  const blob = new Blob([contents.slice().buffer], { type: "image/jpeg" });
  const bitmap = await createImageBitmap(blob, { imageOrientation: "none" });
  try {
    const canvas = makeCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    bitmap.close?.();
  }
}
