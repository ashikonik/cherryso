import { describe, it, expect } from "vitest";
import {
  userProfileSchema,
  orderSchema,
  categorySchema,
  tagSchema,
  productFormSchema,
  productVariantInputSchema,
  productImageInputSchema,
  productStockUpdateSchema,
} from "../lib/validators";

describe("Validators", () => {
  describe("userProfileSchema", () => {
    it("validates a correct BD phone number", () => {
      const result = userProfileSchema.safeParse({
        phoneNumber: "01711223344",
      });
      expect(result.success).toBe(true);
    });

    it("rejects an invalid BD phone number", () => {
      const result = userProfileSchema.safeParse({
        phoneNumber: "123456",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("orderSchema", () => {
    it("requires email and valid phone", () => {
      const result = orderSchema.safeParse({
        customerEmail: "not-an-email",
        customerName: "Jane Doe",
        customerPhone: "01711223344",
        shippingAddressLine1: "123 Cherry St",
        shippingCity: "Dhaka",
        shippingPostalCode: "1212",
        paymentMethod: "cash_on_delivery",
      });
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["customerEmail"]);
      }
    });

    it("accepts a valid order", () => {
      const result = orderSchema.safeParse({
        customerEmail: "jane@example.com",
        customerName: "Jane Doe",
        customerPhone: "01711223344",
        shippingAddressLine1: "123 Cherry St",
        shippingCity: "Dhaka",
        shippingPostalCode: "1212",
        paymentMethod: "cash_on_delivery",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("categorySchema", () => {
    it("accepts a top-level category", () => {
      const result = categorySchema.safeParse({ name: "Beauty", slug: "beauty" });
      expect(result.success).toBe(true);
    });

    it("accepts a child category with a parentId UUID", () => {
      const result = categorySchema.safeParse({
        name: "Lipstick",
        slug: "lipstick",
        parentId: "18944ac4-6a83-4d53-82ae-39b195db2794",
      });
      expect(result.success).toBe(true);
    });

    it("rejects a non-UUID parentId", () => {
      const result = categorySchema.safeParse({
        name: "Lipstick",
        slug: "lipstick",
        parentId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects too-short name", () => {
      const result = categorySchema.safeParse({ name: "A", slug: "a" });
      expect(result.success).toBe(false);
    });
  });

  describe("tagSchema", () => {
    it("accepts a lowercase alphanumeric slug with dashes", () => {
      const result = tagSchema.safeParse({ name: "Vegan", slug: "vegan" });
      expect(result.success).toBe(true);
    });

    it("rejects uppercase slug", () => {
      const result = tagSchema.safeParse({ name: "Vegan", slug: "Vegan" });
      expect(result.success).toBe(false);
    });

    it("rejects slug with spaces", () => {
      const result = tagSchema.safeParse({ name: "Vegan", slug: "vegan friendly" });
      expect(result.success).toBe(false);
    });
  });

  describe("productVariantInputSchema", () => {
    it("accepts a variant with name only", () => {
      const result = productVariantInputSchema.safeParse({
        name: "Large",
        sku: "V-LARGE",
        stock: 5,
      });
      expect(result.success).toBe(true);
    });

    it("accepts a variant with color only", () => {
      const result = productVariantInputSchema.safeParse({
        color: "Red",
        sku: "V-RED",
        stock: 3,
      });
      expect(result.success).toBe(true);
    });

    it("rejects a variant with neither name nor color", () => {
      const result = productVariantInputSchema.safeParse({
        sku: "V-???",
        stock: 1,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative stock", () => {
      const result = productVariantInputSchema.safeParse({
        name: "Large",
        sku: "V-L",
        stock: -1,
      });
      expect(result.success).toBe(false);
    });

    it("accepts a non-integer stock only if we coerce elsewhere (variant stock MUST be int)", () => {
      const result = productVariantInputSchema.safeParse({
        name: "Large",
        sku: "V-L",
        stock: 1.5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("productImageInputSchema", () => {
    it("accepts a valid https URL", () => {
      const result = productImageInputSchema.safeParse({
        url: "https://example.com/img.jpg",
      });
      expect(result.success).toBe(true);
    });

    it("rejects a non-URL string", () => {
      const result = productImageInputSchema.safeParse({ url: "not-a-url" });
      expect(result.success).toBe(false);
    });
  });

  describe("productFormSchema", () => {
    const valid = {
      name: "Lavender Soap",
      slug: "lavender-soap",
      basePrice: "250",
      weightGrams: "120",
      status: "active",
      sku: "LS-1",
      stock: "10",
    };

    it("accepts a minimally valid product", () => {
      const result = productFormSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("coerces basePrice / weightGrams / stock from strings", () => {
      const result = productFormSchema.safeParse(valid);
      if (!result.success) throw new Error("should pass");
      expect(result.data.basePrice).toBe(250);
      expect(result.data.weightGrams).toBe(120);
      expect(result.data.stock).toBe(10);
    });

    it("rejects a negative price", () => {
      const result = productFormSchema.safeParse({ ...valid, basePrice: "-5" });
      expect(result.success).toBe(false);
    });

    it("rejects an invalid status enum", () => {
      const result = productFormSchema.safeParse({ ...valid, status: "deleted" });
      expect(result.success).toBe(false);
    });

    it("rejects a slug with uppercase", () => {
      const result = productFormSchema.safeParse({ ...valid, slug: "Lavender-Soap" });
      expect(result.success).toBe(false);
    });

    it("accepts and validates nested variants", () => {
      const result = productFormSchema.safeParse({
        ...valid,
        variants: [{ name: "Small", sku: "LS-S", stock: 5 }],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("productStockUpdateSchema", () => {
    it("accepts a base stock update with no variants", () => {
      const result = productStockUpdateSchema.safeParse({
        productId: "18944ac4-6a83-4d53-82ae-39b195db2794",
        newStock: 0,
        variantsStock: [],
      });
      expect(result.success).toBe(true);
    });

    it("rejects a non-UUID productId", () => {
      const result = productStockUpdateSchema.safeParse({
        productId: "not-a-uuid",
        newStock: 0,
        variantsStock: [],
      });
      expect(result.success).toBe(false);
    });

    it("rejects a negative newStock", () => {
      const result = productStockUpdateSchema.safeParse({
        productId: "18944ac4-6a83-4d53-82ae-39b195db2794",
        newStock: -1,
        variantsStock: [],
      });
      expect(result.success).toBe(false);
    });
  });
});
