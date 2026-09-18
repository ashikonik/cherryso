"use server"

import { requireAdmin } from "@/lib/auth-utils"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateOrderDetailsAction(orderId: string, data: {
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  shippingAddressLine1: string,
  shippingAddressLine2: string,
  customerNotes: string,
}) {
  await requireAdmin()
  
  await db.update(orders)
    .set({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddressLine1: data.shippingAddressLine1,
      shippingAddressLine2: data.shippingAddressLine2,
      customerNotes: data.customerNotes,
      updatedAt: new Date()
    })
    .where(eq(orders.id, orderId))
    
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
  return { success: true }
}
