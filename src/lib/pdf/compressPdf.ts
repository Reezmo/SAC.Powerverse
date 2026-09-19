import { PDFDocument, PDFName, PDFObject, PDFRawStream, PDFRef, PDFStream } from "pdf-lib";
import { asName, asNumber, describeColorSpace, filterNames, skipReason } from "@/lib/pdf/pdfImageSkip";
import { decodeWithBrowser, decodeWithPdfjs } from "@/lib/pdf/pdfImageDecode";
import { encodeCanvasAsJpeg } from "@/lib/pdf/canvasEncode";

const K = {
  Width: PDFName.of("Width"),
  Height: PDFName.of("Height"),
  Subtype: PDFName.of("Subtype"),
  SMask: PDFName.of("SMask"),
  Mask: PDFName.of("Mask"),
};

const CARRY_OVER = ["Interpolate", "Intent", "OC", "StructParent"].map((key) => PDFName.of(key));

const QUALITY = 70;
const MAX_DIMENSION = 2000;
const MIN_MASK_QUALITY = 60;

function fitDimensions(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Compress a PDF by recompressing its embedded raster images.
 *
 * Best-effort: any error (malformed PDF, decode failure, unsupported
 * structure) falls back to returning the original `file` unchanged, so a
 * compression bug never blocks the upload it runs ahead of.
 */
export async function compressPdf(file: File): Promise<File> {
  try {
    return await compressPdfInner(file);
  } catch (err) {
    console.warn("PDF compression failed, uploading the original file instead:", err);
    return file;
  }
}

async function compressPdfInner(file: File): Promise<File> {
  const inputBytes = new Uint8Array(await file.arrayBuffer());
  const pdfDoc = await PDFDocument.load(inputBytes, { ignoreEncryption: true, updateMetadata: false });
  const context = pdfDoc.context;

  const images: Array<{ ref: PDFRef; stream: PDFStream }> = [];
  for (const [ref, object] of context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFStream)) continue;
    if (asName(object.dict.get(K.Subtype)) !== "Image") continue;
    images.push({ ref, stream: object as PDFStream });
  }

  const maskRefs = new Set<string>();
  for (const { stream } of images) {
    for (const key of [K.SMask, K.Mask]) {
      const value = stream.dict.get(key);
      if (value instanceof PDFRef) maskRefs.add(value.tag);
    }
  }

  for (const { ref, stream } of images) {
    const dict = stream.dict;
    let contents: Uint8Array | null;
    try {
      contents = stream.getContents();
    } catch {
      continue;
    }
    if (!contents) continue;

    const width = asNumber(dict.lookup(K.Width));
    const height = asNumber(dict.lookup(K.Height));
    const filters = filterNames(dict);
    const colorSpace = describeColorSpace(dict);

    if (skipReason(dict, contents.length, width, height, colorSpace, filters)) continue;
    if (!width || !height) continue;

    const isMask = maskRefs.has(ref.tag);
    // wantGray/MIN_MASK_QUALITY are inert until canvasEncode.ts can emit a real
    // single-channel JPEG (see its docstring) — encoded.grayscale is always
    // false today, so the isMask branch below always `continue`s past the
    // point where these would matter.
    const wantGray = isMask;
    const quality = isMask ? Math.max(QUALITY, MIN_MASK_QUALITY) : QUALITY;
    const { width: targetWidth, height: targetHeight } = fitDimensions(width, height, MAX_DIMENSION);

    const plainJpeg =
      filters.length === 1 &&
      filters[0] === "DCTDecode" &&
      (colorSpace.components === 1 || colorSpace.components === 3) &&
      !dict.get(PDFName.of("Decode"));

    let canvas: HTMLCanvasElement | null = null;
    try {
      if (plainJpeg) {
        try {
          canvas = await decodeWithBrowser(contents, targetWidth, targetHeight);
        } catch {
          canvas = null;
        }
      }
      if (!canvas) {
        canvas = await decodeWithPdfjs(stream, context, width, height, targetWidth);
      }
    } catch (err) {
      console.warn("Could not decode PDF image", ref.tag, err);
      continue;
    }

    const encoded = await encodeCanvasAsJpeg(canvas, quality, wantGray);
    if (!encoded) continue;
    if (isMask && !encoded.grayscale) continue; // no grayscale JPEG encoder available; leave the mask untouched
    if (encoded.bytes.length >= contents.length) continue; // recompressing made it bigger

    const replacement: Record<string, string | number | PDFObject> = {
      Type: "XObject",
      Subtype: "Image",
      Width: canvas.width,
      Height: canvas.height,
      ColorSpace: encoded.grayscale ? "DeviceGray" : "DeviceRGB",
      BitsPerComponent: 8,
      Filter: "DCTDecode",
    };
    const smask = dict.get(K.SMask);
    if (smask instanceof PDFRef) replacement.SMask = smask;
    const mask = dict.get(K.Mask);
    if (mask instanceof PDFRef) replacement.Mask = mask;
    for (const key of CARRY_OVER) {
      const value = dict.get(key);
      if (value) replacement[key.decodeText()] = value;
    }

    context.assign(ref, PDFRawStream.of(context.obj(replacement), encoded.bytes));
  }

  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  // `.slice().buffer` (not the Uint8Array itself) to satisfy BlobPart's
  // ArrayBuffer typing, matching the workaround in pdfImageDecode.ts.
  return new File([outputBytes.slice().buffer], file.name, { type: "application/pdf" });
}
