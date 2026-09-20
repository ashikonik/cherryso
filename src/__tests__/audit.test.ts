import { describe, it, expect, vi, beforeEach } from "vitest";

// We mock the db module BEFORE importing the audit helper so the helper sees
// the mocked `db.insert`. This lets us assert what gets written without a
// real Postgres connection.
const mockValues = vi.fn();
const mockInsert = vi.fn(() => ({ values: mockValues }));

vi.mock("../db", () => ({
  db: { insert: () => mockInsert() },
}));

vi.mock("../db/schema", () => ({
  auditLog: { __brand: "auditLog" },
}));

describe("logAdminAction", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockInsert.mockClear();
    mockValues.mockClear();
    // Default: the insert chain resolves successfully. Individual tests
    // override with `mockRejectedValueOnce` to simulate a DB failure.
    mockValues.mockResolvedValue(undefined);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("inserts a row with the right shape", async () => {
    const { logAdminAction } = await import("../lib/audit");
    await logAdminAction({
      userId: "user-1",
      action: "delete",
      entityType: "product",
      entityId: "prod-42",
      details: { reason: "test" },
    });
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockValues).toHaveBeenCalledTimes(1);
    const arg = mockValues.mock.calls[0][0];
    expect(arg).toMatchObject({
      userId: "user-1",
      action: "delete",
      entityType: "product",
      entityId: "prod-42",
      details: { reason: "test" },
    });
  });

  it("uses null for details when not supplied", async () => {
    const { logAdminAction } = await import("../lib/audit");
    await logAdminAction({
      userId: "user-1",
      action: "delete",
      entityType: "product",
      entityId: "prod-42",
    });
    const arg = mockValues.mock.calls[0][0];
    expect(arg.details).toBeNull();
  });

  it("does NOT throw when the insert fails (audit must not block the main action)", async () => {
    mockValues.mockRejectedValueOnce(new Error("DB down"));
    const { logAdminAction } = await import("../lib/audit");
    await expect(
      logAdminAction({
        userId: "user-1",
        action: "delete",
        entityType: "product",
        entityId: "prod-42",
      })
    ).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("logs the failed params to stderr for ops investigation", async () => {
    mockValues.mockRejectedValueOnce(new Error("DB down"));
    const { logAdminAction } = await import("../lib/audit");
    await logAdminAction({
      userId: "user-1",
      action: "delete",
      entityType: "product",
      entityId: "prod-42",
    });
    // The error message must include enough context to find the lost audit row.
    const calls = errorSpy.mock.calls.flat();
    const text = calls.map((c: unknown) => String(c)).join(" ");
    expect(text).toContain("audit");
    expect(text).toContain("prod-42");
  });
});
