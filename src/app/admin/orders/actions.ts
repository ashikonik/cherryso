"use server"

import { requireAdmin } from "@/lib/auth-utils"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateOrderShippingAction(orderId: string, newShippingCost: number, newShippingCity: string) {
  await requireAdmin()
  
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId)
  })

  if (!order) throw new Error("Order not found")

  const newTotal = Number(order.subtotal) - Number(order.discountTotal) + newShippingCost

  await db.update(orders)
    .set({ 
      shippingCost: newShippingCost.toString(),
      shippingCity: newShippingCity,
      total: newTotal.toString(),
      updatedAt: new Date()
    })
    .where(eq(orders.id, orderId))
    
  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  return { success: true }
}
