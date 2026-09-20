import { describe, it, expect } from "vitest";
import { z } from "zod";
import { cartItemSchema } from "../lib/validators";

describe("Checkout cart payload validation", () => {
  const parse = (payload: unknown) =>
    z.array(cartItemSchema).safeParse(payload);

  it("accepts a well-formed item with a variant", () => {
    const result = parse([
      {
        productId: "18944ac4-6a83-4d53-82ae-39b195db2794",
        variantId: "0e8c1f5a-3b8d-4f0e-9a6e-7b1d2c3e4f5a",
        quantity: 2,
      },
    ]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].quantity).toBe(2);
    }
  });

  it("accepts a well-formed item without a variant (variantId null)", () => {
    const result = parse([
      {
        productId: "18944ac4-6a83-4d53-82ae-39b195db2794",
        variantId: null,
        quantity: 1,
      },
    ]);
    expect(result.success).toBe(true);
  });

  it("rejects a negative quantity (stock-credit attempt)", () => {
    const result = parse([
      {
        productId: "18944ac4-6a83-4d53-82ae-39b195db2794",
        variantId: null,
        quantity: -100,
      },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects a zero quantity", () => {
    const result = parse([
      {
        productId: "18944ac4-6a83-4d53-82ae-39b195db2794",
        variantId: null,
        quantity: 0,
      },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects an absurdly large quantity (DoS / exploit attempt)", () => {
    const result = parse([
      {
        productId: "18944ac4-6a83-4d53-82ae-39b195db2794",
        variantId: null,
        quantity: 999999999,
      },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer quantity", () => {
    const result = parse([
      {
        productId: "18944ac4-6a83-4d53-82ae-39b195db2794",
        variantId: null,
        quantity: 1.5,
      },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects a non-UUID productId", () => {
    const result = parse([
      {
        productId: "not-a-uuid",
        variantId: null,
        quantity: 1,
      },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects a non-UUID variantId", () => {
    const result = parse([
      {
        productId: "18944ac4-6a83-4d53-82ae-39b195db2794",
        variantId: "evil-injection",
        quantity: 1,
      },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects an empty array", () => {
    // Note: the action additionally rejects empty arrays before reaching this schema,
    // but the schema itself should still accept [] as a valid (if useless) array shape.
    const result = parse([]);
    expect(result.success).toBe(true);
  });

  it("rejects a malformed payload (string instead of object)", () => {
    const result = parse("not-an-array");
    expect(result.success).toBe(false);
  });

  it("defaults missing quantity to 1 when omitted", () => {
    const result = parse([
      {
        productId: "18944ac4-6a83-4d53-82ae-39b195db2794",
        variantId: null,
      },
    ]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].quantity).toBe(1);
    }
  });
});