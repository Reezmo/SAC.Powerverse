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

Add `pdf-lib` as a dependency (pure JS, no WASM, ~150KB gzipped).

New module: `src/lib/pdf/compressPdf.ts`

```ts
export async function compressPdf(file: File): Promise<File>
```

Behavior:
- Load the file's bytes into `PDFDocument.load()`.
- Walk embedded raster images (JPEG/PNG XObjects) and re-encode them at reduced quality/resolution to shrink the dominant contributor to file size for scanned documents.
- Re-save via `doc.save({ useObjectStreams: true })` for additional size reduction from stream compaction.
- Return a new `File` with the same name/type, built from the compressed bytes.
- On any error (malformed PDF, parsing failure, unsupported structure), catch and return the original `file` unchanged — compression is best-effort, never blocking.

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

- Unit test for `compressPdf`: given a small fixture PDF (with an embedded raster image), verify it returns a `File`, doesn't throw, and output is valid (re-loadable via `pdf-lib`). Given a malformed input, verify it falls back to returning the original file.
- Manual test: upload a large (multi-MB, scanned) PDF through the running app and confirm no 413.

## Files touched

- `package.json` — add `pdf-lib`
- `src/lib/pdf/compressPdf.ts` — new
- `src/lib/pdf/compressPdf.test.ts` — new
- `src/components/submit/AppUploadForm.tsx` — phase state, compression step
- `next.config.ts` — body size limit
