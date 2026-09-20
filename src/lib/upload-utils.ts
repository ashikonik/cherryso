/**
 * Server-side image upload validation.
 *
 * The client compresses + renames files (see lib/image-utils.ts), but the API
 * must NOT trust:
 *   - claimed file.name  (path traversal, weird extensions)
 *   - claimed file.type  (any client can set this to "image/jpeg")
 *   - declared file.size (it's enforced by the runtime when streaming, but
 *     checking early saves bandwidth)
 *
 * Strategy:
 *   1. Allowlist MIME types by the contentType the browser reported.
 *   2. Enforce a hard size cap from the Content-Length header (or the file
 *      object if the runtime populated it).
 *   3. Magic-byte sniff the first 12 bytes to confirm the content actually
 *      matches the declared MIME type. This blocks the most common bypass
 *      where an attacker sends an .html or .svg payload with `image/jpeg`.
 *   4. Derive the stored extension from the MIME type, NEVER from the
 *      user-supplied filename. Generate the storage key with crypto-safe
 *      randomness — no user input ever touches the storage path.
 */

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const MIME_TO_EXT: Record<AllowedImageMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Magic-byte signatures for the four formats we accept. Checks are intentionally
 * loose (a few bytes is enough — we are rejecting obviously-wrong payloads, not
 * running a full image parser). Server-side validation.
 *
 * - JPEG: starts with FF D8 FF
 * - PNG : starts with 89 50 4E 47 0D 0A 1A 0A
 * - GIF : starts with "GIF87a" or "GIF89a" (47 49 46 38 [37|39] 61)
 * - WEBP: starts with "RIFF" (52 49 46 46) and at offset 8 has "WEBP" (57 45 42 50)
 */
export function matchesMagicBytes(
  mime: AllowedImageMime,
  bytes: Uint8Array
): boolean {
  if (bytes.length < 12) return false;
  switch (mime) {
    case "image/jpeg":
      return (
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff
      );
    case "image/png":
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case "image/gif":
      return (
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38 &&
        (bytes[4] === 0x37 || bytes[4] === 0x39) &&
        bytes[5] === 0x61
      );
    case "image/webp":
      return (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      );
  }
}

/**
 * Validate a browser-supplied File against our policy. Returns either:
 *   { ok: true, mime, ext } — caller can proceed to upload with these.
 *   { ok: false, error }   — caller should return a 4xx to the client.
 *
 * The `bytes` argument is the head of the file (the first ~16 bytes is
 * enough for magic-byte sniffing). In Node.js/Edge runtimes the simplest
 * way to get this is `await file.slice(0, 16).arrayBuffer()`.
 */
export function validateImageUpload(
  file: { type: string; size: number; name: string },
  bytes: Uint8Array
):
  | { ok: true; mime: AllowedImageMime; ext: string }
  | { ok: false; error: string } {
  // 1. MIME allowlist
  if (!ALLOWED_IMAGE_MIMES.includes(file.type as AllowedImageMime)) {
    return {
      ok: false,
      error: `Unsupported file type. Allowed: ${ALLOWED_IMAGE_MIMES.join(", ")}`,
    };
  }
  const mime = file.type as AllowedImageMime;

  // 2. Size cap
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: `File too large. Maximum size is ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
    };
  }

  // 3. Magic-byte sniff — reject mismatched payloads (e.g. HTML tagged as image/jpeg)
  if (!matchesMagicBytes(mime, bytes)) {
    return {
      ok: false,
      error: "File contents do not match the declared image type.",
    };
  }

  return { ok: true, mime, ext: MIME_TO_EXT[mime] };
}

/**
 * Build a storage key from a validated MIME type. The user-supplied filename
 * is NEVER used — only a timestamp + crypto-safe random suffix, so attackers
 * can't write to predictable paths or inject traversal sequences.
 */
export function buildStorageKey(ext: string): string {
  const random = crypto
    .randomUUID()
    .replace(/-/g, "")
    .toLowerCase()
    .slice(0, 16);
  return `${Date.now()}-${random}.${ext}`;
}
