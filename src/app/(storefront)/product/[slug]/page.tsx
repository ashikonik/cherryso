import { getStorefrontProductBySlug } from "@/lib/storefront-api"
import { notFound } from "next/navigation"
import { ProductView } from "@/components/storefront/ProductView"
import Link from "next/link"

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const product = await getStorefrontProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      <ProductView product={product} />
    </div>
  )
}
