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
