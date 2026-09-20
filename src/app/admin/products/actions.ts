
"use server"

import { requireAdmin } from "@/lib/auth-utils"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { products, productTags, productImages, productVariants } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import {
  productFormSchema,
  productVariantInputSchema,
  productImageInputSchema,
  productStockUpdateSchema,
} from "@/lib/validators"
import { logAdminAction } from "@/lib/audit"

/**
 * Parse and validate the JSON-stringified `variantsData` / `imagesData` fields
 * the admin product form sends. Returns either `{ ok: true, variants, images }`
 * or `{ ok: false, error }` so callers can return a user-facing error message.
 *
 * On parse/validation failure we fail closed (return the error) rather than
 * silently dropping bad data — the old code logged and continued, which would
 * let hostile payloads create products with no images or no variants.
 */
function parseProductJsonFields(formData: FormData):
  | { ok: true; variants: z.infer<typeof productVariantInputSchema>[]; images: z.infer<typeof productImageInputSchema>[] }
  | { ok: false; error: string } {
  const variantsDataStr = formData.get("variantsData");
  const imagesDataStr = formData.get("imagesData");

  let variants: z.infer<typeof productVariantInputSchema>[] = [];
  let images: z.infer<typeof productImageInputSchema>[] = [];

  try {
    if (typeof variantsDataStr === "string" && variantsDataStr.length > 0) {
      const parsed = JSON.parse(variantsDataStr);
      const result = z.array(productVariantInputSchema).safeParse(parsed);
      if (!result.success) {
        return { ok: false, error: result.error.issues[0]?.message ?? "Invalid variants data" };
      }
      variants = result.data;
    }
    if (typeof imagesDataStr === "string" && imagesDataStr.length > 0) {
      const parsed = JSON.parse(imagesDataStr);
      const result = z.array(productImageInputSchema).safeParse(parsed);
      if (!result.success) {
        return { ok: false, error: result.error.issues[0]?.message ?? "Invalid images data" };
      }
      images = result.data;
    }
  } catch {
    return { ok: false, error: "Failed to parse product variant/image data" };
  }

  return { ok: true, variants, images };
}

export async function createProduct(formData: FormData, oldImagesIgnore: unknown, tagIds: string[]) {
  const user = await requireAdmin()

  const json = parseProductJsonFields(formData);
  if (!json.ok) return { error: json.error };

  const parsed = productFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? undefined,
    basePrice: formData.get("basePrice"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    weightGrams: formData.get("weightGrams") || 0,
    status: formData.get("status"),
    categoryId: formData.get("categoryId") || null,
    sku: formData.get("sku") || undefined,
    stock: formData.get("stock") || 0,
    variants: json.variants,
    images: json.images,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product data" };
  }

  const data = parsed.data;
  const standardSku = data.sku ?? `SKU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Insert product
      const [newProduct] = await tx.insert(products).values({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        basePrice: data.basePrice.toString(),
        compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toString() : null,
        sku: data.variants.length > 0 ? data.variants[0].sku : standardSku, // Fallback SKU
        stock: data.variants.length > 0 ? data.variants.reduce((acc, v) => acc + v.stock, 0) : data.stock, // Total stock
        weightGrams: data.weightGrams,
        status: data.status,
        categoryId: data.categoryId ?? null,
      }).returning()

      // 2. Insert variants (if any)
      if (data.variants.length > 0) {
        await tx.insert(productVariants).values(
          data.variants.map(v => ({
            productId: newProduct.id,
            // refine() in productVariantInputSchema guarantees at least one of
            // name/color is present; fall through with ?? "" would lose data.
            name: v.name ?? v.color ?? "",
            color: v.color ?? null,
            sku: v.sku,
            stock: v.stock,
          }))
        )
      }

      // 3. Insert product tags
      if (tagIds.length > 0) {
        await tx.insert(productTags).values(
          tagIds.map(tagId => ({
            productId: newProduct.id,
            tagId
          }))
        )
      }

      // 4. Insert images with color assignments
      if (data.images.length > 0) {
        await tx.insert(productImages).values(
          data.images.map((img, index) => ({
            productId: newProduct.id,
            url: img.url,
            color: img.color ?? null,
            isPrimary: index === 0,
            position: index
          }))
        )
      }

      return newProduct
    })

    revalidatePath("/admin/products")
    await logAdminAction({
      userId: user.id,
      action: "create",
      entityType: "product",
      entityId: result.id,
      details: {
        name: data.name,
        slug: data.slug,
        basePrice: data.basePrice,
        variantCount: data.variants.length,
        imageCount: data.images.length,
        tagCount: tagIds.length,
      },
    })
    return { success: true, productId: result.id }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function deleteProduct(id: string) {
  const user = await requireAdmin()
  try {
    await db.delete(products).where(eq(products.id, id))
    await logAdminAction({
      userId: user.id,
      action: "delete",
      entityType: "product",
      entityId: id,
    })
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function updateProductStatus(id: string, status: "draft" | "active" | "archived") {
  const user = await requireAdmin()
  try {
    await db.update(products).set({ status }).where(eq(products.id, id))
    await logAdminAction({
      userId: user.id,
      action: "update_status",
      entityType: "product",
      entityId: id,
      details: { newStatus: status },
    })
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function updateProduct(id: string, formData: FormData, oldImagesIgnore: unknown, tagIds: string[]) {
  const user = await requireAdmin()

  // First validate the id is a UUID before we do anything destructive.
  const idCheck = z.string().uuid().safeParse(id);
  if (!idCheck.success) return { error: "Invalid product id" };

  const json = parseProductJsonFields(formData);
  if (!json.ok) return { error: json.error };

  const parsed = productFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? undefined,
    basePrice: formData.get("basePrice"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    weightGrams: formData.get("weightGrams") || 0,
    status: formData.get("status"),
    categoryId: formData.get("categoryId") || null,
    sku: formData.get("sku") || undefined,
    stock: formData.get("stock") || 0,
    variants: json.variants,
    images: json.images,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product data" };
  }

  const data = parsed.data;
  const standardSku = data.sku ?? `SKU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  try {
    await db.transaction(async (tx) => {
      // 1. Update product
      await tx.update(products).set({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        basePrice: data.basePrice.toString(),
        compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toString() : null,
        sku: data.variants.length > 0 ? data.variants[0].sku : standardSku,
        stock: data.variants.length > 0 ? data.variants.reduce((acc, v) => acc + v.stock, 0) : data.stock,
        weightGrams: data.weightGrams,
        status: data.status,
        categoryId: data.categoryId ?? null,
        updatedAt: new Date(),
      }).where(eq(products.id, id))

      // Wipe old relations (tags and images are safe to wipe and replace)
      await tx.delete(productTags).where(eq(productTags.productId, id))
      await tx.delete(productImages).where(eq(productImages.productId, id))

      // Intelligently sync variants to preserve cart/order relationships
      const existingVariants = await tx.select().from(productVariants).where(eq(productVariants.productId, id))
      const incomingIds = data.variants.map((v) => v.id).filter((x): x is string => Boolean(x))

      for (const ev of existingVariants) {
        if (!incomingIds.includes(ev.id)) {
          await tx.delete(productVariants).where(eq(productVariants.id, ev.id))
        }
      }

      for (const v of data.variants) {
        if (v.id) {
          await tx.update(productVariants).set({
            name: v.name ?? v.color ?? "",
            color: v.color ?? null,
            sku: v.sku,
            stock: v.stock,
          }).where(eq(productVariants.id, v.id))
        } else {
          await tx.insert(productVariants).values({
            productId: id,
            name: v.name ?? v.color ?? "",
            color: v.color ?? null,
            sku: v.sku,
            stock: v.stock,
          })
        }
      }

      // 3. Insert tags
      if (tagIds.length > 0) {
        await tx.insert(productTags).values(
          tagIds.map(tagId => ({
            productId: id,
            tagId
          }))
        )
      }

      // 4. Insert images
      if (data.images.length > 0) {
        await tx.insert(productImages).values(
          data.images.map((img, index) => ({
            productId: id,
            url: img.url,
            color: img.color ?? null,
            isPrimary: index === 0,
            position: index
          }))
        )
      }
    })

    revalidatePath("/admin/products")
    await logAdminAction({
      userId: user.id,
      action: "update",
      entityType: "product",
      entityId: id,
      details: {
        name: data.name,
        slug: data.slug,
        basePrice: data.basePrice,
        status: data.status,
        variantCount: data.variants.length,
        imageCount: data.images.length,
        tagCount: tagIds.length,
      },
    })
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function quickUpdateStock(
  productId: string,
  newStock: number,
  variantsStock: { id: string; stock: number }[]
) {
  const user = await requireAdmin()

  const parsed = productStockUpdateSchema.safeParse({
    productId,
    newStock,
    variantsStock,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid stock update" };
  }

  await db.transaction(async (tx) => {
    // Update base product stock
    await tx.update(products).set({ stock: parsed.data.newStock }).where(eq(products.id, parsed.data.productId))

    // Update variants stock
    if (parsed.data.variantsStock.length > 0) {
      for (const variant of parsed.data.variantsStock) {
        await tx.update(productVariants).set({ stock: variant.stock }).where(eq(productVariants.id, variant.id))
      }
    }
  })

  await logAdminAction({
    userId: user.id,
    action: "update_stock",
    entityType: "product",
    entityId: parsed.data.productId,
    details: {
      newStock: parsed.data.newStock,
      variantUpdates: parsed.data.variantsStock.map((v) => ({ id: v.id, stock: v.stock })),
    },
  })

  revalidatePath("/admin/products")
  revalidatePath("/products")
}
