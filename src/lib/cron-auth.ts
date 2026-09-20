import { NextResponse } from "next/server";

/**
 * Shared auth gate for scheduled / cron endpoints.
 *
 * Returns:
 *   - `null` if the request is authorized (caller proceeds with work).
 *   - A `NextResponse` (4xx/5xx) if the request must be rejected. The caller
 *     should `return auth` immediately.
 *
 * Policy:
 *   - If `expectedSecret` is unset on the server, we REFUSE to run. This is a
 *     loud-fail: missing secret == misconfigured deploy == never accept the
 *     request, even if no secret was provided.
 *   - We use a constant-time string comparison so attackers can't measure
 *     timing differences to guess the secret character-by-character. The
 *     secret is short (env var), so the timing attack surface is small, but
 *     defence-in-depth costs nothing.
 *
 * Header:
 *   `x-cron-secret` must equal `expectedSecret`.
 */
export function checkCronAuth(
  request: Request,
  expectedSecret: string | undefined
): NextResponse | null {
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  const provided = request.headers.get("x-cron-secret") ?? "";

  // Constant-time compare. We don't bail early on length mismatch because that
  // would leak length information. Walk both strings to the longer length.
  if (!constantTimeEquals(provided, expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

function constantTimeEquals(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
