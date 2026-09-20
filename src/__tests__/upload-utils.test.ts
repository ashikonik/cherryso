import { describe, it, expect } from "vitest";
import {
  validateImageUpload,
  matchesMagicBytes,
  buildStorageKey,
  ALLOWED_IMAGE_MIMES,
  MAX_IMAGE_BYTES,
} from "../lib/upload-utils";

/**
 * Build a small synthetic buffer with the given bytes prepended and padded
 * with zeros to a usable length. Used for magic-byte sniffing tests.
 */
function buf(...bytes: number[]): Uint8Array {
  const out = new Uint8Array(32);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i];
  return out;
}

// Realistic magic-byte signatures for the four formats we accept.
const JPEG_HEAD = buf(0xff, 0xd8, 0xff, 0xe0);
const PNG_HEAD = buf(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const GIF87_HEAD = buf(0x47, 0x49, 0x46, 0x38, 0x37, 0x61);
const GIF89_HEAD = buf(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);
const WEBP_HEAD = buf(
  0x52, 0x49, 0x46, 0x46, // RIFF
  0x24, 0x00, 0x00, 0x00, // file size (irrelevant for us)
  0x57, 0x45, 0x42, 0x50  // WEBP
);

describe("matchesMagicBytes", () => {
  it("accepts JPEG (FF D8 FF)", () => {
    expect(matchesMagicBytes("image/jpeg", JPEG_HEAD)).toBe(true);
  });

  it("accepts PNG (89 50 4E 47 0D 0A 1A 0A)", () => {
    expect(matchesMagicBytes("image/png", PNG_HEAD)).toBe(true);
  });

  it("accepts GIF87a", () => {
    expect(matchesMagicBytes("image/gif", GIF87_HEAD)).toBe(true);
  });

  it("accepts GIF89a", () => {
    expect(matchesMagicBytes("image/gif", GIF89_HEAD)).toBe(true);
  });

  it("accepts WEBP (RIFF....WEBP)", () => {
    expect(matchesMagicBytes("image/webp", WEBP_HEAD)).toBe(true);
  });

  it("rejects payloads shorter than 12 bytes (can't be any image)", () => {
    expect(matchesMagicBytes("image/webp", new Uint8Array(8))).toBe(false);
  });

  it("rejects HTML sent as image/jpeg", () => {
    const html = buf(0x3c, 0x21, 0x44, 0x4f, 0x43, 0x54, 0x59, 0x50); // <!DOCTYPE
    expect(matchesMagicBytes("image/jpeg", html)).toBe(false);
  });

  it("rejects an SVG sent as image/png", () => {
    const svg = buf(0x3c, 0x73, 0x76, 0x67); // <svg
    expect(matchesMagicBytes("image/png", svg)).toBe(false);
  });

  it("rejects RIFF container that isn't WEBP (e.g. AVI/WAV)", () => {
    const avi = buf(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x20); // RIFF....AVI
    expect(matchesMagicBytes("image/webp", avi)).toBe(false);
  });
});

describe("validateImageUpload", () => {
  it("accepts a valid JPEG payload", () => {
    const result = validateImageUpload(
      { type: "image/jpeg", size: 1024, name: "photo.jpg" },
      JPEG_HEAD
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mime).toBe("image/jpeg");
      expect(result.ext).toBe("jpg");
    }
  });

  it("accepts a valid PNG payload", () => {
    const result = validateImageUpload(
      { type: "image/png", size: 1024, name: "photo.png" },
      PNG_HEAD
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.ext).toBe("png");
  });

  it("rejects a non-allowlisted MIME type (image/svg+xml)", () => {
    const result = validateImageUpload(
      { type: "image/svg+xml", size: 100, name: "evil.svg" },
      PNG_HEAD
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Unsupported/);
  });

  it("rejects application/pdf (not in allowlist)", () => {
    const result = validateImageUpload(
      { type: "application/pdf", size: 100, name: "doc.pdf" },
      PNG_HEAD
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a file over the 5MB cap", () => {
    const result = validateImageUpload(
      { type: "image/jpeg", size: MAX_IMAGE_BYTES + 1, name: "big.jpg" },
      JPEG_HEAD
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/too large/i);
  });

  it("accepts a file exactly at the size cap", () => {
    const result = validateImageUpload(
      { type: "image/jpeg", size: MAX_IMAGE_BYTES, name: "exact.jpg" },
      JPEG_HEAD
    );
    expect(result.ok).toBe(true);
  });

  it("rejects mismatched MIME/magic bytes (HTML masquerading as JPEG)", () => {
    const html = buf(0x3c, 0x68, 0x74, 0x6d, 0x6c); // <html
    const result = validateImageUpload(
      { type: "image/jpeg", size: 100, name: "evil.jpg" },
      html
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/do not match/i);
  });

  it("ignores the user-supplied filename when deriving extension", () => {
    // Filename says .html but the bytes are a real PNG — we still store it as .png.
    const result = validateImageUpload(
      { type: "image/png", size: 100, name: "totally-not-evil.html" },
      PNG_HEAD
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.ext).toBe("png");
  });
});

describe("buildStorageKey", () => {
  it("always includes a timestamp and a random suffix", () => {
    const a = buildStorageKey("png");
    const b = buildStorageKey("png");
    expect(a).not.toBe(b);
    expect(a).toMatch(/^\d{13}-[0-9a-f]{16}\.png$/);
  });

  it("uses the supplied extension verbatim", () => {
    expect(buildStorageKey("jpg")).toMatch(/\.jpg$/);
    expect(buildStorageKey("webp")).toMatch(/\.webp$/);
  });
});

describe("ALLOWED_IMAGE_MIMES", () => {
  it("contains exactly the four image formats we accept", () => {
    expect(ALLOWED_IMAGE_MIMES.length).toBe(4);
    expect([...ALLOWED_IMAGE_MIMES].sort()).toEqual(
      ["image/gif", "image/jpeg", "image/png", "image/webp"].sort()
    );
  });
});
