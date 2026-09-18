"use server"

import { requireAdmin } from "@/lib/auth-utils"
import { db } from "@/db"
import { siteSettings } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

export async function savePaymentMethodsAction(methods: any[]) {
  await requireAdmin()
  
  await db.insert(siteSettings)
    .values({
      key: "payment_methods",
      value: methods,
      description: "Active payment methods"
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: methods, updatedAt: new Date() }
    })
    
  revalidatePath("/")
  revalidatePath("/checkout")
  revalidatePath("/admin/settings/payments")
  
  return { success: true }
}
