import { z } from "zod";

// User Profiles
export const userProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
  phoneNumber: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "Invalid Bangladeshi phone number").optional(),
  addressLine1: z.string().min(5, "Address must be at least 5 characters").optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(2).optional(),
  postalCode: z.string().min(4).optional(),
  avatarUrl: z.string().url().optional(),
});

// Categories
export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url().optional().nullable(),
});

// Products
export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  basePrice: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().min(2),
  stock: z.coerce.number().int().nonnegative().default(0),
  weightGrams: z.coerce.number().int().nonnegative().default(0),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

// Reviews
export const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).optional(),
  content: z.string().min(10, "Review must be at least 10 characters").optional(),
});

// Cart
export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().positive().default(1),
});

// Order Creation
export const orderSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(2),
  customerPhone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "Invalid Bangladeshi phone number"),
  shippingAddressLine1: z.string().min(5),
  shippingAddressLine2: z.string().optional(),
  shippingCity: z.string().min(2),
  shippingPostalCode: z.string().min(4),
  paymentMethod: z.string(), // e.g., 'cash_on_delivery', 'bkash'
});
