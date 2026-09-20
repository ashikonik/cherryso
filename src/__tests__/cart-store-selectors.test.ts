import { describe, it, expect } from "vitest";
import { selectCartTotal, selectCartCount } from "../store/cart-store";
import type { CartItem } from "../store/cart-store";

const makeItem = (overrides: Partial<CartItem>): CartItem => ({
  id: "id-1",
  productId: "uuid-1",
  variantId: null,
  name: "Test",
  color: null,
  price: 100,
  quantity: 1,
  maxStock: 99,
  image: "",
  ...overrides,
});

describe("Cart store selectors", () => {
  it("selectCartTotal returns 0 for empty cart", () => {
    expect(selectCartTotal({ items: [] } as never)).toBe(0);
  });

  it("selectCartTotal sums price × quantity", () => {
    const items = [
      makeItem({ id: "a", price: 100, quantity: 2 }), // 200
      makeItem({ id: "b", price: 50, quantity: 3 }),  // 150
    ];
    expect(selectCartTotal({ items } as never)).toBe(350);
  });

  it("selectCartTotal coerces NaN/undefined price to 0 (defends against corrupted localStorage)", () => {
    const items = [
      makeItem({ id: "a", price: NaN as unknown as number, quantity: 5 }),
      makeItem({ id: "b", price: 10, quantity: 1 }),
    ];
    expect(selectCartTotal({ items } as never)).toBe(10);
  });

  it("selectCartTotal rounds to 2 decimals", () => {
    const items = [
      makeItem({ id: "a", price: 33.33, quantity: 3 }),
    ];
    // 33.33 * 3 = 99.99
    expect(selectCartTotal({ items } as never)).toBe(99.99);
  });

  it("selectCartCount sums quantities", () => {
    const items = [
      makeItem({ id: "a", quantity: 2 }),
      makeItem({ id: "b", quantity: 3 }),
      makeItem({ id: "c", quantity: 7 }),
    ];
    expect(selectCartCount({ items } as never)).toBe(12);
  });

  it("selectCartCount returns 0 for empty cart", () => {
    expect(selectCartCount({ items: [] } as never)).toBe(0);
  });

  it("selectCartCount coerces NaN/undefined quantity to 0", () => {
    const items = [
      makeItem({ id: "a", quantity: 5 }),
      makeItem({ id: "b", quantity: NaN as unknown as number }),
    ];
    expect(selectCartCount({ items } as never)).toBe(5);
  });
});