import { getStorefrontProducts } from "@/lib/storefront-api"
import { ProductCard } from "@/components/storefront/ProductCard"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : undefined;
  const products = await getStorefrontProducts({ limit: 100, searchQuery: query })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {query ? `Search results for "${query}"` : "All Products"}
        </h1>
        <p className="text-muted-foreground">
          {query ? `Found ${products.length} products.` : "Browse our complete collection of delightful items."}
        </p>
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
              <h3 className="text-xl font-semibold mb-2">Nothing here yet</h3>
              <p className="text-muted-foreground">Check back later for new arrivals!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
