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

  it("skips unrecognised color spaces", async () => {
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
    expect(reason).toMatch(/unrecognised color space/);
  });
});
