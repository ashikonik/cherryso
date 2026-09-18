import { db } from "@/db"
import { products, categories, tags, productVariants, productImages } from "@/db/schema"
import { eq, desc, and, ilike, or } from "drizzle-orm"

import { sql as drizzleSql } from "drizzle-orm"

export async function getStorefrontProducts(options: { 
  limit?: number, 
  categoryId?: string, 
  tagSlug?: string,
  searchQuery?: string
} = {}) {
  const { limit = 20, categoryId, tagSlug, searchQuery } = options

  if (searchQuery) {
    // Use our custom Postgres function for full-text search
    const results = await db.execute(
      drizzleSql`SELECT * FROM search_products(${searchQuery}) WHERE status = 'active' LIMIT ${limit}`
    )
    
    // We need to fetch the relations for these products manually since db.execute returns raw rows
    // To keep it simple, we can just do a findMany with an IN clause on the matched IDs
    const productIds = results.map(r => r.id as string)
    if (productIds.length === 0) return []
    
    return await db.query.products.findMany({
      where: (products, { inArray }) => inArray(products.id, productIds),
      with: {
        images: { orderBy: (images, { asc }) => [asc(images.position)] },
        variants: true,
        category: true,
      }
    })
  }

  // Basic query for active products
  const query = db.query.products.findMany({
    where: and(
      eq(products.status, "active"),
      categoryId ? eq(products.categoryId, categoryId) : undefined
    ),
    orderBy: [desc(products.createdAt)],
    limit,
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.position)]
      },
      variants: true,
      category: true,
    }
  })

  return await query
}

export async function getStorefrontProductBySlug(slug: string) {
  return await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.status, "active")),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.position)]
      },
      variants: true,
      category: true,
      tags: {
        with: {
          tag: true
        }
      }
    }
  })
}

export async function getStorefrontCategories() {
  return await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)]
  })
}
