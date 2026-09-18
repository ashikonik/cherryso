import { db } from "@/db"
import { categories } from "@/db/schema"
import { CategoryClient } from "./category-client"
import { desc } from "drizzle-orm"

export default async function CategoriesPage() {
  const allCategories = await db.query.categories.findMany({
    orderBy: [desc(categories.createdAt)],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories and hierarchy.</p>
        </div>
      </div>
      
      <CategoryClient initialCategories={allCategories} />
    </div>
  )
}
