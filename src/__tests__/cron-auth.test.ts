import { describe, it, expect } from "vitest";
import { checkCronAuth } from "../lib/cron-auth";

function reqWithSecret(secret: string | null): Request {
  const headers = new Headers();
  if (secret !== null) headers.set("x-cron-secret", secret);
  return new Request("http://localhost/api/cron/x", { method: "POST", headers });
}

describe("checkCronAuth", () => {
  it("returns 500 when CRON_SECRET is unset (refuse to run unconfigured)", () => {
    const res = checkCronAuth(reqWithSecret("anything"), undefined);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(500);
  });

  it("returns 500 when CRON_SECRET is empty string", () => {
    const res = checkCronAuth(reqWithSecret("anything"), "");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(500);
  });

  it("returns 401 when the header is missing", () => {
    const res = checkCronAuth(reqWithSecret(null), "real-secret");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it("returns 401 when the header doesn't match", () => {
    const res = checkCronAuth(reqWithSecret("wrong-secret"), "real-secret");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it("returns 401 when the header has a different length (no length leak via early-bail)", () => {
    // The constant-time compare must NOT short-circuit on length. We can't
    // directly observe timing in a unit test, but we CAN assert that the
    // 401 response is returned for all wrong-length inputs.
    const res = checkCronAuth(reqWithSecret("a"), "a-much-longer-secret");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it("returns null (allow) when the secret matches exactly", () => {
    const res = checkCronAuth(reqWithSecret("real-secret"), "real-secret");
    expect(res).toBeNull();
  });

  it("returns 401 when one character is wrong", () => {
    // Sanity check that a single-character substitution is rejected.
    // (Trailing-whitespace tests aren't viable — the Headers API trims trailing
    // whitespace from header values, which is correct behavior.)
    const res = checkCronAuth(reqWithSecret("real-secreT"), "real-secret");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });
});
