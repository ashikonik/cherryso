"use server"

import { requireAdmin } from "@/lib/auth-utils"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const STEADFAST_API_URL = "https://portal.steadfast.com.bd/api/v1/create_order"

export async function createSteadfastConsignmentAction(orderId: string) {
  await requireAdmin()
  
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId)
  })

  if (!order) throw new Error("Order not found")
  if (order.courierConsignmentId) throw new Error("Consignment already exists")

  const apiKey = process.env.STEADFAST_API_KEY
  const secretKey = process.env.STEADFAST_SECRET_KEY

  if (!apiKey || !secretKey) {
    throw new Error("Steadfast API keys are not configured in environment variables.")
  }

  // Calculate COD amount
  // If payment status is "paid", COD amount should be 0. Otherwise it's the full total.
  const codAmount = order.paymentStatus === "paid" ? 0 : Number(order.total)

  const payload = {
    invoice: order.orderNumber,
    recipient_name: order.customerName,
    recipient_phone: order.customerPhone,
    recipient_address: `${order.shippingAddressLine1} ${order.shippingAddressLine2 || ''} - ${order.shippingCity}, ${order.shippingPostalCode}`,
    cod_amount: codAmount,
    note: order.customerNotes || "CherrySo Order"
  }

  try {
    const response = await fetch(STEADFAST_API_URL, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.status === 200 && data.consignment) {
      // Update order with tracking details
      await db.update(orders)
        .set({
          courierConsignmentId: data.consignment.consignment_id.toString(),
          courierTrackingUrl: data.consignment.tracking_code, // Steadfast usually returns tracking_code, we can build the URL or just save the code.
          status: 'processing', // Auto-update status when sent to courier
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId))
        
      revalidatePath(`/admin/orders/${orderId}`)
      revalidatePath("/admin/orders")
      return { success: true, trackingCode: data.consignment.tracking_code }
    } else {
      console.error("Steadfast API Error:", data)
      throw new Error(data.message || JSON.stringify(data.errors) || "Failed to create consignment")
    }

  } catch (err: any) {
    console.error("Steadfast Exception:", err)
    throw new Error(err.message || "Failed to connect to Steadfast Courier")
  }
}
