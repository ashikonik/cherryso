import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { RotatingGreeting } from "@/components/storefront/RotatingGreeting";
import { getStorefrontProducts, getStorefrontCategories } from "@/lib/storefront-api";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function Home() {
  const newArrivals = await getStorefrontProducts({ limit: 4 })
  const categories = await getStorefrontCategories()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="mb-8 p-12 bg-muted/50 rounded-[3rem] w-full max-w-4xl border border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          
          <RotatingGreeting />
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto relative z-10">
            Curated accessories, gifts, and stationery. Treat yourself to a little slice of joy.
          </p>
          
          <div className="flex gap-4 justify-center relative z-10">
            <Link href="/products" className={buttonVariants({ size: "lg", className: "rounded-full font-bold text-lg px-8" })}>
              Shop All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map(cat => (
            <Link 
              key={cat.id} 
              href={`/category/${cat.slug}`}
              className="px-6 py-3 bg-card border rounded-full hover:border-primary hover:text-primary transition-colors font-medium shadow-sm"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-12 mb-16">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">New Arrivals ✨</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">View All →</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          {newArrivals.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">No products found. Stay tuned!</p>
          )}
        </div>
      </section>
    </div>
  );
}
