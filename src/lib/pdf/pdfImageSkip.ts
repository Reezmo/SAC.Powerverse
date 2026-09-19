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

// pdf-lib doesn't export a single common numeric wrapper type to instanceof-check
// against (PDFNumber isn't exposed uniformly across the object graph), so we duck-type
// the asNumber() method instead of using instanceof like asName/isTrue below.
export function asNumber(obj: unknown): number | null {
  return obj && typeof (obj as { asNumber?: unknown }).asNumber === "function"
    ? (obj as { asNumber: () => number }).asNumber()
    : null;
}

export function asName(obj: unknown): string | null {
  return obj instanceof PDFName ? obj.decodeText() : null;
}

export function filterNames(dict: PDFDict): string[] {
  const filter = dict.lookup(K.Filter);
  if (filter instanceof PDFName) return [filter.decodeText()];
  if (filter instanceof PDFArray) {
    return filter
      .asArray()
      .map(asName)
      // Non-PDFName entries become null and are dropped here; that's intentional —
      // such filters just won't match string checks like "Crypt"/"JPXDecode" later.
      .filter((name): name is string => Boolean(name));
  }
  return [];
}

/** `{ name, components }` for an image's color space; components is null when unknown. */
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
  if (dict.lookup(K.Mask) instanceof PDFArray) return "color-key masked";
  // Deliberately .get (not .lookup): we only care whether /Matte is present,
  // not what it resolves to, so there's no need to dereference indirect references.
  if (dict.get(K.Matte)) return "pre-blended soft mask";
  if ((asNumber(dict.lookup(K.SMaskInData)) || 0) > 0) return "alpha inside a JPEG 2000 stream";
  if (filters.includes("Crypt")) return "encrypted stream";
  if (dict.lookup(K.ColorSpace) instanceof PDFName && colorSpace.components === null) {
    return `unrecognised color space (${colorSpace.name})`;
  }
  if (colorSpace.name === "None" && !filters.includes("JPXDecode")) {
    return "no color space";
  }
  if (byteLength < MIN_STREAM_BYTES || width * height < MIN_PIXELS) return "already tiny";
  return null;
}
