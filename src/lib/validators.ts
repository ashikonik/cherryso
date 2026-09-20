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
  // Upper bound guards against accidental/hostile absurd quantities at the validation
  // layer (DB CHECK on stock is the second line of defense). 999 is well above any
  // realistic single-cart line item.
  quantity: z.number().int().positive().max(999).default(1),
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

// Tags (admin)
export const tagSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
});

// Product variants (admin)
// `id` is optional: only present when editing an existing variant.
// `name` and `color` are individually optional but at least one must be present
// (the schema enforces "name XOR color" at the form level, not here — keep the
// variant schema permissive and let the action code default `name = color`).
export const productVariantInputSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
    sku: z.string().min(2),
    stock: z.coerce.number().int().nonnegative(),
  })
  .refine((v) => Boolean(v.name) || Boolean(v.color), {
    message: "Variant must have either a name or a color",
  });

// Product images (admin)
export const productImageInputSchema = z.object({
  url: z.string().url(),
  color: z.string().nullable().optional(),
});

// Product form (admin create + update)
// FormData submits everything as strings, so we coerce numerics.
export const productFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().optional().nullable(),
  basePrice: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  weightGrams: z.coerce.number().int().nonnegative().default(0),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  categoryId: z.string().uuid().optional().nullable(),
  // Standard SKU/stock are used when there are no variants.
  sku: z.string().optional(),
  stock: z.coerce.number().int().nonnegative().default(0),
  // variantsData / imagesData are JSON-stringified arrays validated separately.
  variants: z.array(productVariantInputSchema).default([]),
  images: z.array(productImageInputSchema).default([]),
});

// Product stock quick-edit (admin)
export const productStockUpdateSchema = z.object({
  productId: z.string().uuid(),
  newStock: z.coerce.number().int().nonnegative(),
  variantsStock: z
    .array(
      z.object({
        id: z.string().uuid(),
        stock: z.coerce.number().int().nonnegative(),
      })
    )
    .default([]),
});
