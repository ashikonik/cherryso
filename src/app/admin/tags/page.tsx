import { db } from "@/db"
import { tags } from "@/db/schema"
import { TagClient } from "./tag-client"
import { desc } from "drizzle-orm"

export default async function TagsPage() {
  const allTags = await db.query.tags.findMany({
    orderBy: [desc(tags.name)],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">Manage your product tags.</p>
        </div>
      </div>
      
      <TagClient initialTags={allTags} />
    </div>
  )
}
