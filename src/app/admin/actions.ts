"use server"

import { requireAdmin } from "@/lib/auth-utils"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function quickUpdateOrderStatus(orderId: string, newStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded") {
  await requireAdmin()
  
  await db.update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    
  revalidatePath("/admin")
  revalidatePath("/admin/orders")
}
