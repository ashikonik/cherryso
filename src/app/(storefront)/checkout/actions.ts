"use server"

import { db } from "@/db"
import { orders, orderItems, productVariants, products, shippingZones } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

export async function createOrderAction(formData: FormData) {
  try {
    const customerName = formData.get("customerName") as string
    const customerPhone = formData.get("customerPhone") as string
    const customerEmail = (formData.get("customerEmail") as string) || null
    const shippingZoneId = formData.get("shippingZoneId") as string
    const shippingAddress = formData.get("shippingAddress") as string
    const orderNotes = (formData.get("orderNotes") as string) || null
    const paymentMethod = (formData.get("paymentMethod") as string) || "cash_on_delivery"
    const transactionId = (formData.get("transactionId") as string) || null
    const senderNumber = (formData.get("senderNumber") as string) || null
    
    const cartItemsStr = formData.get("cartItems") as string
    const cartItems = JSON.parse(cartItemsStr) as any[]

    if (!customerName || !customerPhone || !shippingZoneId || !shippingAddress || cartItems.length === 0) {
      return { error: "Missing required fields." }
    }

    // Validate Bangladesh Phone Number
    const bdPhoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(customerPhone.replace(/\s+/g, ''))) {
      return { error: "Please enter a valid Bangladeshi phone number (e.g., 017XXXXXXXX or +88017XXXXXXXX)." }
    }

    let createdOrderId = ""

    // CRITICAL: Database Transaction for Stock Reservation & Order Creation
    await db.transaction(async (tx) => {
      let calculatedSubtotal = 0;
      const verifiedItems = [];

      // 1. Verify stock AND securely fetch real prices from the database
      for (const item of cartItems) {
        if (item.variantId) {
          const variant = await tx.query.productVariants.findFirst({
            where: eq(productVariants.id, item.variantId),
            with: { product: true }
          })
          
          if (!variant || variant.stock < item.quantity) {
            throw new Error(`Not enough stock for ${item.name} (${item.color})`)
          }
          
          const realPrice = Number(variant.product.basePrice); // Assuming priceOverride is not fully implemented, we use basePrice
          calculatedSubtotal += realPrice * item.quantity;
          
          verifiedItems.push({
            productId: variant.productId,
            variantId: variant.id,
            productName: variant.product.name,
            variantName: variant.color || variant.name,
            quantity: item.quantity,
            priceAtPurchase: realPrice.toString()
          });

          // Deduct stock
          await tx.update(productVariants)
            .set({ stock: sql`${productVariants.stock} - ${item.quantity}` })
            .where(eq(productVariants.id, item.variantId))
            
        } else {
          const product = await tx.query.products.findFirst({
            where: eq(products.id, item.productId)
          })
          
          if (!product || product.stock < item.quantity) {
            throw new Error(`Not enough stock for ${item.name}`)
          }
          
          const realPrice = Number(product.basePrice);
          calculatedSubtotal += realPrice * item.quantity;

          verifiedItems.push({
            productId: product.id,
            variantId: null,
            productName: product.name,
            variantName: null,
            quantity: item.quantity,
            priceAtPurchase: realPrice.toString()
          });

          // Deduct stock
          await tx.update(products)
            .set({ stock: sql`${products.stock} - ${item.quantity}` })
            .where(eq(products.id, item.productId))
        }
      }

      // Re-verify Shipping Cost from DB
      const zone = await tx.query.shippingZones.findFirst({
        where: eq(shippingZones.id, shippingZoneId)
      });
      if (!zone) throw new Error("Invalid shipping zone");
      
      const realShippingCost = Number(zone.baseRate);
      const realGrandTotal = calculatedSubtotal + realShippingCost;

      // Generate a simple order number
      const orderNum = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`

      // Append sender number to notes if provided
      const finalNotes = senderNumber ? `${orderNotes || ""}\n[Payment Sender: ${senderNumber}]`.trim() : orderNotes;

      // 2. Create the Order securely
      const [newOrder] = await tx.insert(orders).values({
        userId: null,
        orderNumber: orderNum,
        status: "pending",
        paymentStatus: paymentMethod === "cash_on_delivery" ? "pending" : "pending", // Will be verified by admin
        paymentMethod: paymentMethod,
        transactionId: transactionId ? (senderNumber ? `[${senderNumber}] ${transactionId}` : transactionId) : null,
        customerName,
        customerPhone,
        customerEmail: customerEmail || "guest@example.com",
        shippingAddressLine1: shippingAddress,
        shippingCity: zone.zoneName, 
        shippingPostalCode: "0000",
        subtotal: calculatedSubtotal.toString(),
        shippingCost: realShippingCost.toString(),
        total: realGrandTotal.toString(),
        customerNotes: finalNotes,
      }).returning()
      
      createdOrderId = newOrder.id

      // 3. Create Order Items
      const itemsToInsert = verifiedItems.map(item => ({
        orderId: newOrder.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      }))

      await tx.insert(orderItems).values(itemsToInsert)
    })

    return { success: true, orderId: createdOrderId }
    
  } catch (error: any) {
    console.error("Order creation failed:", error)
    return { error: error.message || "Failed to create order. Please try again." }
  }
}
