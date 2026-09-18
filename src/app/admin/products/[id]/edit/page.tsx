import { db } from "@/db"
import { products, categories, tags } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ProductForm } from "../../product-form"
import { notFound } from "next/navigation"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      images: true,
      tags: true,
      variants: true,
    }
  })

  if (!product) {
    notFound()
  }

  const allCategories = await db.select().from(categories)
  const allTags = await db.select().from(tags)

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Make changes to {product.name}.</p>
      </div>
      
      <ProductForm 
        categories={allCategories} 
        tags={allTags} 
        initialData={product}
      />
    </div>
  )
}
