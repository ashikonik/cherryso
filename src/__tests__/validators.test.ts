import { describe, it, expect } from "vitest";
import { userProfileSchema, orderSchema } from "../lib/validators";

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
});
