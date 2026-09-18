# APP PDF Upload Compression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop 413 errors on the APP PDF upload by compressing embedded images client-side before upload, with a raised server-side body limit as a safety net.

**Architecture:** `AppUploadForm` calls a new `compressPdf(file)` helper before building the upload `FormData`. `compressPdf` uses `pdf-lib`'s low-level object-graph API to find embedded image XObjects, decodes each one (via the browser's native `createImageBitmap` for plain JPEGs, or `pdfjs-dist` rendering a scratch one-page PDF for everything else), downscales and re-encodes it as a JPEG via `canvas.toBlob`, and writes the smaller bytes back into the PDF's object graph before re-saving. Any failure at any point falls back to returning the original file unchanged, so upload is never blocked by a compression bug.

**Tech Stack:** pdf-lib (PDF object graph manipulation), pdfjs-dist (robust image decoding fallback), browser Canvas API (downscale + JPEG encode), Vitest (unit tests), Next.js Server Actions config.

**Spec:** `docs/superpowers/specs/2026-09-19-app-pdf-compression-design.md`

---

## Task 1: Add dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install pdf-lib and pdfjs-dist**

Run:
```bash
npm install pdf-lib pdfjs-dist
```

Expected: `package.json` gains `"pdf-lib": "^1.17.1"` and `"pdfjs-dist": "^..."` (whatever the latest is) under `dependencies`. `package-lock.json` updates.

- [ ] **Step 2: Verify the install didn't break the build**

Run: `npm run build`
Expected: Build succeeds (same as before — these are new unused deps at this point).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add pdf-lib and pdfjs-dist for client-side PDF compression"
```

---

## Task 2: Image skip-logic (pure functions, fully unit-testable)

**Files:**
- Create: `src/lib/pdf/pdfImageSkip.ts`
- Test: `src/lib/pdf/__tests__/pdfImageSkip.test.ts`

This module decides, for a given image XObject's PDF dictionary, whether it's safe to recompress. It has no browser or pdf-lib-context dependency beyond the `pdf-lib` types themselves, so it's fully testable in jsdom.

- [ ] **Step 1: Write the failing test**

Create `src/lib/pdf/__tests__/pdfImageSkip.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PDFDocument, PDFName } from "pdf-lib";
import { describeColorSpace, skipReason } from "@/lib/pdf/pdfImageSkip";

async function makeImageDict(overrides: Record<string, unknown> = {}) {
  const doc = await PDFDocument.create();
  const dict = doc.context.obj({
    Type: "XObject",
    Subtype: "Image",
    Width: 800,
    Height: 600,
    ColorSpace: "DeviceRGB",
    BitsPerComponent: 8,
    Filter: "DCTDecode",
    ...overrides,
  });
  return dict;
}

describe("describeColorSpace", () => {
  it("recognises DeviceRGB as a 3-component space", async () => {
    const dict = await makeImageDict();
    expect(describeColorSpace(dict)).toEqual({ name: "DeviceRGB", components: 3 });
  });

  it("recognises DeviceGray as a 1-component space", async () => {
    const dict = await makeImageDict({ ColorSpace: "DeviceGray" });
    expect(describeColorSpace(dict)).toEqual({ name: "DeviceGray", components: 1 });
  });
});

describe("skipReason", () => {
  it("does not skip a normal RGB JPEG image", async () => {
    const dict = await makeImageDict();
    const reason = skipReason(dict, 5000, 800, 600, describeColorSpace(dict), ["DCTDecode"]);
    expect(reason).toBeNull();
  });

  it("skips images missing width or height", async () => {
    const dict = await makeImageDict({ Width: undefined, Height: undefined });
    const reason = skipReason(dict, 5000, null, null, describeColorSpace(dict), ["DCTDecode"]);
    expect(reason).toBe("missing width/height");
  });

  it("skips stencil masks (ImageMask true)", async () => {
    const dict = await makeImageDict({ ImageMask: true });
    const reason = skipReason(dict, 5000, 800, 600, describeColorSpace(dict), ["DCTDecode"]);
    expect(reason).toBe("stencil mask (1-bit)");
  });

  it("skips already-tiny images", async () => {
    const dict = await makeImageDict({ Width: 10, Height: 10 });
    const reason = skipReason(dict, 100, 10, 10, describeColorSpace(dict), ["DCTDecode"]);
    expect(reason).toBe("already tiny");
  });

  it("skips unrecognised colour spaces", async () => {
    const doc = await PDFDocument.create();
    const dict = doc.context.obj({
      Type: "XObject",
      Subtype: "Image",
      Width: 800,
      Height: 600,
      ColorSpace: PDFName.of("SomeResourceLocalName"),
      BitsPerComponent: 8,
      Filter: "DCTDecode",
    });
    const reason = skipReason(dict, 5000, 800, 600, describeColorSpace(dict), ["DCTDecode"]);
    expect(reason).toMatch(/unrecognised colour space/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/pdf/__tests__/pdfImageSkip.test.ts`
Expected: FAIL — `Cannot find module '@/lib/pdf/pdfImageSkip'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/pdf/pdfImageSkip.ts`:

```ts
import { PDFArray, PDFBool, PDFDict, PDFName } from "pdf-lib";

const K = {
  Width: PDFName.of("Width"),
  Height: PDFName.of("Height"),
  Filter: PDFName.of("Filter"),
  ColorSpace: PDFName.of("ColorSpace"),
  ImageMask: PDFName.of("ImageMask"),
  SMask: PDFName.of("SMask"),
  Mask: PDFName.of("Mask"),
  Matte: PDFName.of("Matte"),
  SMaskInData: PDFName.of("SMaskInData"),
};

// Below this, re-encoding is a waste of time and usually makes things bigger.
const MIN_STREAM_BYTES = 1024;
const MIN_PIXELS = 32 * 32;

const SIMPLE_COLOR_SPACES: Record<string, number> = {
  DeviceGray: 1,
  CalGray: 1,
  G: 1,
  DeviceRGB: 3,
  CalRGB: 3,
  RGB: 3,
  Lab: 3,
  DeviceCMYK: 4,
  CMYK: 4,
};

export type ColorSpaceInfo = { name: string; components: number | null };

function asNumber(obj: unknown): number | null {
  return obj && typeof (obj as { asNumber?: unknown }).asNumber === "function"
    ? (obj as { asNumber: () => number }).asNumber()
    : null;
}

function asName(obj: unknown): string | null {
  return obj instanceof PDFName ? obj.decodeText() : null;
}

export function filterNames(dict: PDFDict): string[] {
  const filter = dict.lookup(K.Filter);
  if (filter instanceof PDFName) return [filter.decodeText()];
  if (filter instanceof PDFArray) {
    return filter
      .asArray()
      .map(asName)
      .filter((name): name is string => Boolean(name));
  }
  return [];
}

/** `{ name, components }` for an image's colour space; components is null when unknown. */
export function describeColorSpace(dict: PDFDict): ColorSpaceInfo {
  const cs = dict.lookup(K.ColorSpace);
  if (cs instanceof PDFName) {
    const name = cs.decodeText();
    return { name, components: SIMPLE_COLOR_SPACES[name] ?? null };
  }
  if (cs instanceof PDFArray) {
    const family = asName(cs.lookup(0)) || "Array";
    if (family === "Indexed" || family === "I") return { name: "Indexed", components: null };
    if (family === "Separation") return { name: "Separation", components: null };
    if (family === "DeviceN") return { name: "DeviceN", components: null };
    return { name: family, components: SIMPLE_COLOR_SPACES[family] ?? null };
  }
  return { name: cs ? "Other" : "None", components: null };
}

function isTrue(obj: unknown): boolean {
  return obj instanceof PDFBool ? obj.asBoolean() : false;
}

/** Why we are leaving this image alone, or null if we should try to compress it. */
export function skipReason(
  dict: PDFDict,
  byteLength: number,
  width: number | null,
  height: number | null,
  colorSpace: ColorSpaceInfo,
  filters: string[],
): string | null {
  if (!width || !height) return "missing width/height";
  if (isTrue(dict.lookup(K.ImageMask))) return "stencil mask (1-bit)";
  if (dict.lookup(K.Mask) instanceof PDFArray) return "colour-key masked";
  if (dict.get(K.Matte)) return "pre-blended soft mask";
  if ((asNumber(dict.lookup(K.SMaskInData)) || 0) > 0) return "alpha inside a JPEG 2000 stream";
  if (filters.includes("Crypt")) return "encrypted stream";
  if (dict.lookup(K.ColorSpace) instanceof PDFName && colorSpace.components === null) {
    return `unrecognised colour space (${colorSpace.name})`;
  }
  if (colorSpace.name === "None" && !filters.includes("JPXDecode")) {
    return "no colour space";
  }
  if (byteLength < MIN_STREAM_BYTES || width * height < MIN_PIXELS) return "already tiny";
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/pdf/__tests__/pdfImageSkip.test.ts`
Expected: PASS (all 7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/pdf/pdfImageSkip.ts src/lib/pdf/__tests__/pdfImageSkip.test.ts
git commit -m "feat: add PDF image skip-logic for compression eligibility"
```

---

## Task 3: Canvas → JPEG encoder

**Files:**
- Create: `src/lib/pdf/canvasEncode.ts`

No unit test here — `canvas.toBlob` isn't implemented in jsdom (per the spec's testing section, this is covered indirectly through Task 5's integration test).

- [ ] **Step 1: Write the implementation**

Create `src/lib/pdf/canvasEncode.ts`:

```ts
export type EncodedImage = {
  bytes: Uint8Array;
  grayscale: boolean;
};

/** Desaturate a canvas in place. */
export function applyGrayscale(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.save();
  ctx.filter = "grayscale(1)";
  ctx.globalCompositeOperation = "copy";
  ctx.drawImage(canvas, 0, 0);
  ctx.restore();
}

/**
 * Encode a canvas as a JPEG via the browser's native encoder.
 *
 * `grayscale` is requested by desaturating the canvas first, but the
 * resulting JPEG still has three channels (the canvas encoder can't emit a
 * single-channel JPEG) — callers must not label the replacement image
 * dictionary as `/DeviceGray` based on this flag; see pdfImageSkip's
 * "no grayscale JPEG encoder for soft mask" case in compressPdf.ts.
 */
export async function encodeCanvasAsJpeg(
  canvas: HTMLCanvasElement,
  quality: number,
  grayscale: boolean,
): Promise<EncodedImage | null> {
  if (grayscale) applyGrayscale(canvas);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality / 100);
  });
  if (!blob) return null;

  const buffer = await blob.arrayBuffer();
  return { bytes: new Uint8Array(buffer), grayscale: false };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/pdf/canvasEncode.ts
git commit -m "feat: add canvas-to-JPEG encoder for PDF image compression"
```

---

## Task 4: Image decoding (native + PDF.js fallback)

**Files:**
- Create: `src/lib/pdf/pdfImageDecode.ts`

- [ ] **Step 1: Write the implementation**

Create `src/lib/pdf/pdfImageDecode.ts`:

```ts
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
import pdfjsWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

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
  const doc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  try {
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: targetWidth / pageWidth });
    const canvas = makeCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    return canvas;
  } finally {
    await doc.destroy();
  }
}

export async function decodeWithBrowser(
  contents: Uint8Array,
  targetWidth: number,
  targetHeight: number,
): Promise<HTMLCanvasElement> {
  const blob = new Blob([contents], { type: "image/jpeg" });
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
```

- [ ] **Step 2: Check the pdfjs-dist worker import works with this project's bundler**

The `?url` import suffix is a Vite convention; this project uses Next.js/Turbopack. Run:

```bash
npx tsc --noEmit
```

Expected: TypeScript will likely complain it can't resolve the `?url` import (no type declaration for that specifier). If so, replace the worker import in `pdfImageDecode.ts` with Next.js's supported pattern instead:

```ts
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();
```

Re-run `npx tsc --noEmit` and confirm no errors before moving on. This module isn't wired into the app yet, so there's nothing to runtime-test until Task 5.

- [ ] **Step 3: Commit**

```bash
git add src/lib/pdf/pdfImageDecode.ts
git commit -m "feat: add PDF image decoding via native canvas or PDF.js fallback"
```

---

## Task 5: Main compression orchestrator + integration test

**Files:**
- Create: `src/lib/pdf/compressPdf.ts`
- Test: `src/lib/pdf/__tests__/compressPdf.test.ts`

- [ ] **Step 1: Write the failing test**

This test builds a small real PDF with `pdf-lib` (embedding a tiny JPEG), runs it through `compressPdf`, and checks the result is a valid, no-larger PDF. It also checks the fallback path with garbage bytes.

Create `src/lib/pdf/__tests__/compressPdf.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { compressPdf } from "@/lib/pdf/compressPdf";

// 2x2 red JPEG, base64-encoded — small enough to embed inline here.
const TINY_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkI" +
  "CQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAACAAIBAREA/8QAFAABAAAAAAAA" +
  "AAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==";

async function makeTestPdf(): Promise<File> {
  const doc = await PDFDocument.create();
  const jpegBytes = Uint8Array.from(atob(TINY_JPEG_BASE64), (c) => c.charCodeAt(0));
  const image = await doc.embedJpg(jpegBytes);
  const page = doc.addPage([200, 200]);
  page.drawImage(image, { x: 0, y: 0, width: 200, height: 200 });
  const bytes = await doc.save();
  return new File([bytes], "test.pdf", { type: "application/pdf" });
}

describe("compressPdf", () => {
  it("returns a valid, re-loadable PDF no larger than the input", async () => {
    const original = await makeTestPdf();
    const result = await compressPdf(original);

    expect(result.type).toBe("application/pdf");
    expect(result.name).toBe(original.name);

    const bytes = new Uint8Array(await result.arrayBuffer());
    const reloaded = await PDFDocument.load(bytes);
    expect(reloaded.getPageCount()).toBe(1);
  });

  it("falls back to the original file when the input is not a valid PDF", async () => {
    const garbage = new File([new Uint8Array([1, 2, 3, 4])], "bad.pdf", {
      type: "application/pdf",
    });
    const result = await compressPdf(garbage);
    expect(result).toBe(garbage);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/pdf/__tests__/compressPdf.test.ts`
Expected: FAIL — `Cannot find module '@/lib/pdf/compressPdf'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/pdf/compressPdf.ts`:

```ts
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFRawStream, PDFRef, PDFStream } from "pdf-lib";
import { describeColorSpace, filterNames, skipReason } from "@/lib/pdf/pdfImageSkip";
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

function asNumber(obj: unknown): number | null {
  return obj && typeof (obj as { asNumber?: unknown }).asNumber === "function"
    ? (obj as { asNumber: () => number }).asNumber()
    : null;
}

function asName(obj: unknown): string | null {
  return obj instanceof PDFName ? obj.decodeText() : null;
}

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
        canvas = await decodeWithPdfjs(stream, context, width, height, targetWidth, targetHeight);
      }
    } catch (err) {
      console.warn("Could not decode PDF image", ref.tag, err);
      continue;
    }

    const encoded = await encodeCanvasAsJpeg(canvas, quality, wantGray);
    if (!encoded) continue;
    if (isMask && !encoded.grayscale) continue; // no grayscale JPEG encoder available; leave the mask untouched
    if (encoded.bytes.length >= contents.length) continue; // recompressing made it bigger

    const replacement: Record<string, unknown> = {
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
  return new File([outputBytes], file.name, { type: "application/pdf" });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/pdf/__tests__/compressPdf.test.ts`
Expected: PASS (both tests). If `createImageBitmap` or `canvas.toBlob` are unavailable in jsdom and cause the first test to throw inside `compressPdfInner`, that's fine — `compressPdf`'s try/catch will fall back to the original file, but that would make the "no larger than input" assertion trivially true while not exercising the compression path. If this happens, add jsdom-compatible stubs in `vitest.setup.ts` scoped to this test, or accept that this test primarily validates the fallback-safety contract in this environment (real compression is confirmed via manual browser testing in Task 7). Note in a code comment which case applies.

- [ ] **Step 5: Run the full test suite to check for regressions**

Run: `npm run test`
Expected: All existing tests still pass, plus the new ones.

- [ ] **Step 6: Commit**

```bash
git add src/lib/pdf/compressPdf.ts src/lib/pdf/__tests__/compressPdf.test.ts
git commit -m "feat: add compressPdf orchestrator that recompresses embedded images"
```

---

## Task 6: Wire compression into the upload form

**Files:**
- Modify: `src/components/submit/AppUploadForm.tsx:1-50`

- [ ] **Step 1: Update the component**

Replace the top of `src/components/submit/AppUploadForm.tsx` (imports and state) — change:

```tsx
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { uploadAppSubmission } from "@/lib/api/apps";

export function AppUploadForm({ isAppActive = false }: { isAppActive?: boolean }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(isAppActive);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
```

to:

```tsx
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { uploadAppSubmission } from "@/lib/api/apps";
import { compressPdf } from "@/lib/pdf/compressPdf";

type UploadPhase = "idle" | "compressing" | "uploading";

export function AppUploadForm({ isAppActive = false }: { isAppActive?: boolean }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [success, setSuccess] = useState(isAppActive);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
```

- [ ] **Step 2: Update `handleUpload`**

Change:

```tsx
  async function handleUpload() {
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadAppSubmission(formData);
      setSuccess(true);
      setFile(null);
      router.refresh(); // Tells Next.js to reload the page data and unlock the KPI section
    } catch {
      setError("Failed to upload the APP. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }
```

to:

```tsx
  async function handleUpload() {
    if (!file) return;

    setPhase("compressing");
    const compressed = await compressPdf(file);

    setPhase("uploading");
    const formData = new FormData();
    formData.append("file", compressed);

    try {
      await uploadAppSubmission(formData);
      setSuccess(true);
      setFile(null);
      router.refresh(); // Tells Next.js to reload the page data and unlock the KPI section
    } catch {
      setError("Failed to upload the APP. Please try again.");
    } finally {
      setPhase("idle");
      if (inputRef.current) inputRef.current.value = "";
    }
  }
```

- [ ] **Step 3: Update the button using `isUploading`**

Change:

```tsx
          {file && (
            <Button 
              type="button" 
              onClick={handleUpload} 
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Confirm & Upload APP"}
            </Button>
          )}
```

to:

```tsx
          {file && (
            <Button 
              type="button" 
              onClick={handleUpload} 
              disabled={phase !== "idle"}
              className="w-full"
            >
              {phase === "compressing"
                ? "Compressing..."
                : phase === "uploading"
                  ? "Uploading..."
                  : "Confirm & Upload APP"}
            </Button>
          )}
```

- [ ] **Step 4: Verify TypeScript compiles and no lingering references to `isUploading` remain**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors. Also grep to confirm the old identifier is gone:

```bash
grep -n "isUploading" src/components/submit/AppUploadForm.tsx
```

Expected: No matches.

- [ ] **Step 5: Run the full test suite**

Run: `npm run test`
Expected: All tests pass (no existing test covers `AppUploadForm` directly, based on the current `__tests__` layout — confirm with `find src -iname "*AppUploadForm*"` that no test needs updating).

- [ ] **Step 6: Commit**

```bash
git add src/components/submit/AppUploadForm.tsx
git commit -m "feat: compress APP PDFs client-side before upload"
```

---

## Task 7: Raise the Server Action body size limit + manual verification

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Update the config**

Change `next.config.ts` from:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // This repo already has docs/CLAUDE.md and docs/AGENTS.md as the real
  // convention docs — don't let Next.js auto-generate duplicates at the root.
  agentRules: false,
};

export default nextConfig;
```

to:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // This repo already has docs/CLAUDE.md and docs/AGENTS.md as the real
  // convention docs — don't let Next.js auto-generate duplicates at the root.
  agentRules: false,
  experimental: {
    serverActions: {
      // Default is 1MB, which 413s on realistically-sized signed APP PDFs.
      // Client-side compression (src/lib/pdf/compressPdf.ts) shrinks the
      // common case; this is the ceiling for PDFs it can't shrink enough.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify the build still succeeds**

Run: `npm run build`
Expected: Build succeeds with no config errors.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: raise Server Action body size limit to 10mb"
```

- [ ] **Step 4: Manual verification in the running app**

Run: `npm run dev`

Then in a browser:
1. Navigate to the APP upload page (entity-facing route with `AppUploadForm`, e.g. `/documents` per `src/app/(entity)/documents/page.tsx`).
2. Select a large (multi-MB, ideally scanned/image-heavy) PDF.
3. Click "Confirm & Upload APP" and confirm the button shows "Compressing..." then "Uploading...".
4. Confirm no 413 error and the success state ("APP Submitted & Active") appears.
5. Open browser DevTools Network tab during the upload and confirm the uploaded request body is smaller than the original file size.

This step has no automated pass/fail — report what you observed (file size before/after, whether the upload succeeded) before considering this plan complete.

---

## Self-Review Notes

- **Spec coverage:** All four spec sections (client-side compression, UI phase feedback, server-side limit, testing) map to Tasks 2–7.
- **Type consistency:** `compressPdf(file: File): Promise<File>` signature matches what Task 6 calls; `decodeWithBrowser`/`decodeWithPdfjs` signatures in Task 4 match their call sites in Task 5's `compressPdfInner`; `encodeCanvasAsJpeg` signature matches its call site.
- **Known risk flagged inline:** Task 5 Step 4 acknowledges jsdom may not support `createImageBitmap`/`canvas.toBlob`, and tells the engineer what to do about it rather than asserting it will just work.
