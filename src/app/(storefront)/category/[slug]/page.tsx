import { getStorefrontProducts } from "@/lib/storefront-api"
import { ProductCard } from "@/components/storefront/ProductCard"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug)
  })

  if (!category) {
    notFound()
  }

  const products = await getStorefrontProducts({ categoryId: category.id, limit: 100 })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 capitalize">{category.name}</h1>
        <p className="text-muted-foreground">Browse all products in {category.name}.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters (Static for now) */}
        <div className="w-full md:w-64 shrink-0 space-y-6 hidden md:block">
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Filters</h3>
            <div className="p-4 bg-muted/30 rounded-xl border">
              <p className="text-sm text-muted-foreground italic">Filters are coming soon!</p>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed">
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">We couldn't find any products in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
