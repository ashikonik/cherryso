import { db } from "@/db"
import { products } from "@/db/schema"
import { desc } from "drizzle-orm"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProductClient } from "./product-client"

export default async function ProductsPage() {
  const allProducts = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: {
      category: true,
      variants: true,
      images: {
        where: (images, { eq }) => eq(images.isPrimary, true),
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your store&apos;s inventory and listings.</p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      <ProductClient initialProducts={allProducts} />
    </div>
  )
}
