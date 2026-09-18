
"use server"

import { requireAdmin } from "@/lib/auth-utils"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { tags } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function createTag(formData: FormData) {
  await requireAdmin()
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string

  if (!name || !slug) return { error: "Name and slug are required" }

  try {
    await db.insert(tags).values({
      name,
      slug,
    })
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function deleteTag(id: string) {
  await requireAdmin()
  try {
    await db.delete(tags).where(eq(tags.id, id))
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}
