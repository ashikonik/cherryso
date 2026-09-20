
"use server"

import { requireAdmin } from "@/lib/auth-utils"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { categorySchema } from "@/lib/validators"
import { logAdminAction } from "@/lib/audit"

export async function createCategory(formData: FormData) {
  const user = await requireAdmin()
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? undefined,
    parentId: formData.get("parentId") || null,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category data" }
  }

  try {
    const [created] = await db.insert(categories).values({
      name: parsed.data.name,
      slug: parsed.data.slug,
      parentId: parsed.data.parentId ?? null,
    }).returning({ id: categories.id })
    if (created) {
      await logAdminAction({
        userId: user.id,
        action: "create",
        entityType: "category",
        entityId: created.id,
        details: { name: parsed.data.name, slug: parsed.data.slug },
      })
    }
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function deleteCategory(id: string) {
  const user = await requireAdmin()
  try {
    await db.delete(categories).where(eq(categories.id, id))
    await logAdminAction({
      userId: user.id,
      action: "delete",
      entityType: "category",
      entityId: id,
    })
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}
