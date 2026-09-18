
"use server"

import { requireAdmin } from "@/lib/auth-utils"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { products, productTags, productImages, productVariants } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function createProduct(formData: FormData, oldImagesIgnore: any[], tagIds: string[]) {
  await requireAdmin()
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const description = formData.get("description") as string
  const basePrice = formData.get("basePrice") as string
  const compareAtPrice = formData.get("compareAtPrice") as string
  const weightGrams = parseInt(formData.get("weightGrams") as string) || 0
  const status = formData.get("status") as "draft" | "active" | "archived"
  const categoryId = formData.get("categoryId") as string || null
  
  // Standard SKU/Stock if no variants
  const standardSku = formData.get("sku") as string || `SKU-${Math.random().toString(36).substring(2,6).toUpperCase()}`
  const standardStock = parseInt(formData.get("stock") as string) || 0
  
  // Parse Complex JSON Data
  const variantsDataStr = formData.get("variantsData") as string
  const imagesDataStr = formData.get("imagesData") as string
  
  let variants: { name: string, color: string, sku: string, stock: number }[] = []
  let images: { url: string, color: string | null }[] = []
  
  try {
    if (variantsDataStr) variants = JSON.parse(variantsDataStr)
    if (imagesDataStr) images = JSON.parse(imagesDataStr)
  } catch (e) {
    console.error("Failed to parse variants or images JSON")
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Insert product
      const [newProduct] = await tx.insert(products).values({
        name,
        slug,
        description,
        basePrice,
        compareAtPrice: compareAtPrice ? compareAtPrice : null,
        sku: variants.length > 0 ? variants[0].sku : standardSku, // Fallback SKU
        stock: variants.length > 0 ? variants.reduce((acc, v) => acc + v.stock, 0) : standardStock, // Total stock
        weightGrams,
        status,
        categoryId,
      }).returning()

      // 2. Insert variants (if any)
      if (variants.length > 0) {
        await tx.insert(productVariants).values(
          variants.map(v => ({
            productId: newProduct.id,
            name: v.name || v.color,
            color: v.color,
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
      if (images.length > 0) {
        await tx.insert(productImages).values(
          images.map((img, index) => ({
            productId: newProduct.id,
            url: img.url,
            color: img.color,
            isPrimary: index === 0,
            position: index
          }))
        )
      }
      
      return newProduct
    })

    revalidatePath("/admin/products")
    return { success: true, productId: result.id }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  try {
    await db.delete(products).where(eq(products.id, id))
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function updateProductStatus(id: string, status: "draft" | "active" | "archived") {
  await requireAdmin()
  try {
    await db.update(products).set({ status }).where(eq(products.id, id))
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function updateProduct(id: string, formData: FormData, oldImagesIgnore: any[], tagIds: string[]) {
  await requireAdmin()
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const description = formData.get("description") as string
  const basePrice = formData.get("basePrice") as string
  const compareAtPrice = formData.get("compareAtPrice") as string
  const weightGrams = parseInt(formData.get("weightGrams") as string) || 0
  const status = formData.get("status") as "draft" | "active" | "archived"
  const categoryId = formData.get("categoryId") as string || null
  
  const standardSku = formData.get("sku") as string || `SKU-${Math.random().toString(36).substring(2,6).toUpperCase()}`
  const standardStock = parseInt(formData.get("stock") as string) || 0
  
  const variantsDataStr = formData.get("variantsData") as string
  const imagesDataStr = formData.get("imagesData") as string
  
  let variants: { name: string, color: string, sku: string, stock: number }[] = []
  let images: { url: string, color: string | null }[] = []
  
  try {
    if (variantsDataStr) variants = JSON.parse(variantsDataStr)
    if (imagesDataStr) images = JSON.parse(imagesDataStr)
  } catch (e) {
    console.error("Failed to parse variants or images JSON")
  }

  try {
    await db.transaction(async (tx) => {
      // 1. Update product
      await tx.update(products).set({
        name,
        slug,
        description,
        basePrice,
        compareAtPrice: compareAtPrice ? compareAtPrice : null,
        sku: variants.length > 0 ? variants[0].sku : standardSku,
        stock: variants.length > 0 ? variants.reduce((acc, v) => acc + v.stock, 0) : standardStock,
        weightGrams,
        status,
        categoryId,
        updatedAt: new Date(),
      }).where(eq(products.id, id))

      // Wipe old relations (tags and images are safe to wipe and replace)
      await tx.delete(productTags).where(eq(productTags.productId, id))
      await tx.delete(productImages).where(eq(productImages.productId, id))

      // Intelligently sync variants to preserve cart/order relationships
      const existingVariants = await tx.select().from(productVariants).where(eq(productVariants.productId, id))
      const incomingIds = variants.map((v: any) => v.id).filter(Boolean)

      for (const ev of existingVariants) {
        if (!incomingIds.includes(ev.id)) {
          await tx.delete(productVariants).where(eq(productVariants.id, ev.id))
        }
      }

      for (const v of variants as any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        if (v.id) {
          await tx.update(productVariants).set({
            name: v.name || v.color,
            color: v.color,
            sku: v.sku,
            stock: v.stock,
          }).where(eq(productVariants.id, v.id))
        } else {
          await tx.insert(productVariants).values({
            productId: id,
            name: v.name || v.color,
            color: v.color,
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
      if (images.length > 0) {
        await tx.insert(productImages).values(
          images.map((img, index) => ({
            productId: id,
            url: img.url,
            color: img.color,
            isPrimary: index === 0,
            position: index
          }))
        )
      }
    })

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function quickUpdateStock(productId: string, newStock: number, variantsStock: { id: string, stock: number }[]) {
  await requireAdmin()
  
  await db.transaction(async (tx) => {
    // Update base product stock
    await tx.update(products).set({ stock: newStock }).where(eq(products.id, productId))
    
    // Update variants stock
    if (variantsStock && variantsStock.length > 0) {
      for (const variant of variantsStock) {
        await tx.update(productVariants).set({ stock: variant.stock }).where(eq(productVariants.id, variant.id))
      }
    }
  })
  
  revalidatePath("/admin/products")
  revalidatePath("/products")
}
