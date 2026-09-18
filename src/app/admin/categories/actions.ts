
"use server"

import { requireAdmin } from "@/lib/auth-utils"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function createCategory(formData: FormData) {
  await requireAdmin()
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const parentId = formData.get("parentId") as string || null

  if (!name || !slug) return { error: "Name and slug are required" }

  try {
    await db.insert(categories).values({
      name,
      slug,
      parentId,
    })
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin()
  try {
    await db.delete(categories).where(eq(categories.id, id))
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}
