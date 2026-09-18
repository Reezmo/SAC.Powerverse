# APP PDF Upload Compression

## Problem

[AppUploadForm.tsx](../../../src/components/submit/AppUploadForm.tsx) uploads the signed Annual Performance Plan PDF via `uploadAppSubmission`, a Next.js Server Action defined in [apps.ts](../../../src/lib/api/apps.ts). Next.js Server Actions default to a 1MB request body limit on Vercel. Any APP PDF over roughly 1MB (common for scanned, signed documents) fails with a 413 before the request reaches the backend API.

## Goals

- Let entities upload realistically-sized signed APP PDFs without hitting 413s.
- Don't block the user if compression can't shrink the file enough — always attempt the upload.
- Keep the fix contained to the upload path; no backend or API contract changes.

## Non-goals

- Server-side/backend PDF compression.
- Vector graphics or font subsetting.
- Upload progress percentage UI.
- Guaranteeing every PDF fits under any particular size (some PDFs — pure vector/text — won't shrink much).

## Design

### 1. Client-side compression

Add `pdf-lib` and `pdfjs-dist` as dependencies.

Enumerating and replacing embedded image XObjects requires pdf-lib's lower-level `PDFDocument.context` API (there is no high-level "recompress this PDF" call). Decoding the wide variety of real-world image encodings (indexed color, CMYK, ICC-based, JPEG 2000, CCITT fax, etc.) reliably requires rendering through `pdfjs-dist`, not hand-rolled decoders — plain baseline JPEGs (the common case) decode faster via the browser's native `createImageBitmap`, with PDF.js as the fallback for everything else. This mirrors the proven approach in [drikusroor/compress-pdf](https://github.com/drikusroor/compress-pdf) (MIT), adapted into TypeScript modules for this codebase and using the browser's native `canvas.toBlob('image/jpeg', quality)` encoder rather than a vendored MozJPEG WASM build (out of scope — no self-hosted WASM/worker assets).

Modules under `src/lib/pdf/`:
- `compressPdf.ts` — public entry point: `compressPdf(file: File): Promise<File>`. Orchestrates the pass: load with `PDFDocument.load`, enumerate image XObjects via `context.enumerateIndirectObjects()`, decide per-image whether to skip or compress, re-save with `doc.save({ useObjectStreams: true })`. Catches any error and returns the original `file` unchanged — compression is best-effort, never blocking.
- `pdfImageSkip.ts` — pure functions deciding whether an image XObject is safe to recompress (skip stencil masks, colour-key masks, unrecognised colour spaces, already-tiny images, encrypted streams) — ported from the reference's `skipReason`.
- `pdfImageDecode.ts` — decodes one image XObject to a canvas: try `createImageBitmap` directly for plain single-filter DCTDecode JPEGs, otherwise wrap the XObject in a throwaway one-page PDF and render it via `pdfjs-dist`.
- `canvasEncode.ts` — canvas → JPEG bytes via `canvas.toBlob('image/jpeg', quality)`.

Behavior:
- Downscale large images to a max dimension (e.g. 2000px) and re-encode at a fixed quality (e.g. 70%).
- Preserve `/SMask` and `/Mask` references on the replacement image dictionary; skip images already flagged as masks from being desaturated incorrectly.
- Skip (leave untouched) any image where re-encoding would make it bigger, or where decoding fails.
- Always upload the result of compression (or the original on failure) — no hard block if it's still large.

### 2. Upload flow changes

[AppUploadForm.tsx](../../../src/components/submit/AppUploadForm.tsx) `handleUpload`:
- Replace the single `isUploading` boolean with a phase: `"idle" | "compressing" | "uploading"`.
- Sequence: set phase to `"compressing"` → await `compressPdf(file)` → set phase to `"uploading"` → build `FormData` with the (possibly compressed) file → `uploadAppSubmission(formData)`.
- Button label reflects the phase: "Compressing..." / "Uploading...".
- Always proceeds to upload regardless of resulting size — no client-side size gate that blocks submission.

### 3. Server-side safety net

[next.config.ts](../../../next.config.ts): set

```ts
experimental: {
  serverActions: {
    bodySizeLimit: "10mb",
  },
},
```

This raises the ceiling for PDFs compression can't shrink enough (e.g., text/vector-heavy documents with no large images), while compression keeps the common case (scanned/signed documents) well under it.

## Testing

- Unit tests for `pdfImageSkip.ts` (pure functions, easy to test in isolation: masks, unrecognised colour spaces, tiny images all return a skip reason; a normal RGB JPEG XObject returns null).
- Unit test for `compressPdf`: given a small fixture PDF (with an embedded raster image) built with `pdf-lib` in the test itself, verify it returns a `File`, doesn't throw, and output is valid (re-loadable via `pdf-lib`) and no larger than the input. Given a malformed input, verify it falls back to returning the original file.
- `pdfImageDecode.ts` and `canvasEncode.ts` depend on browser APIs (`createImageBitmap`, `canvas.toBlob`) that jsdom doesn't implement — cover them indirectly through the `compressPdf` integration test rather than in isolation, consistent with how this codebase already tests browser-dependent code.
- Manual test: upload a large (multi-MB, scanned) PDF through the running app and confirm no 413.

## Files touched

- `package.json` — add `pdf-lib`, `pdfjs-dist`
- `src/lib/pdf/compressPdf.ts` — new
- `src/lib/pdf/pdfImageSkip.ts` — new
- `src/lib/pdf/pdfImageDecode.ts` — new
- `src/lib/pdf/canvasEncode.ts` — new
- `src/lib/pdf/__tests__/compressPdf.test.ts` — new
- `src/lib/pdf/__tests__/pdfImageSkip.test.ts` — new
- `src/components/submit/AppUploadForm.tsx` — phase state, compression step
- `next.config.ts` — body size limit
