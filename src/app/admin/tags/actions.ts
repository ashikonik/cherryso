
"use server"

import { requireAdmin } from "@/lib/auth-utils"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { tags } from "@/db/schema"
import { eq } from "drizzle-orm"
import { tagSchema } from "@/lib/validators"
import { logAdminAction } from "@/lib/audit"

export async function createTag(formData: FormData) {
  const user = await requireAdmin()
  const parsed = tagSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid tag data" }
  }

  try {
    const [created] = await db.insert(tags).values({
      name: parsed.data.name,
      slug: parsed.data.slug,
    }).returning({ id: tags.id })
    if (created) {
      await logAdminAction({
        userId: user.id,
        action: "create",
        entityType: "tag",
        entityId: created.id,
        details: { name: parsed.data.name, slug: parsed.data.slug },
      })
    }
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}

export async function deleteTag(id: string) {
  const user = await requireAdmin()
  try {
    await db.delete(tags).where(eq(tags.id, id))
    await logAdminAction({
      userId: user.id,
      action: "delete",
      entityType: "tag",
      entityId: id,
    })
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message }
  }
}
