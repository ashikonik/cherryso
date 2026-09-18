import { db } from "@/db"
import { categories, tags } from "@/db/schema"
import { ProductForm } from "../product-form"

export default async function NewProductPage() {
  const allCategories = await db.query.categories.findMany()
  const allTags = await db.query.tags.findMany()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product listing in your store.</p>
      </div>

      <ProductForm categories={allCategories} tags={allTags} />
    </div>
  )
}
