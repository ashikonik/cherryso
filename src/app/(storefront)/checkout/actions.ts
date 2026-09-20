"use server"

import { db } from "@/db"
import { orders, orderItems, productVariants, products, shippingZones } from "@/db/schema"
import { eq, sql, and, gte } from "drizzle-orm"
import { z } from "zod"
import { headers } from "next/headers"
import { cartItemSchema } from "@/lib/validators"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function createOrderAction(formData: FormData) {
  try {
    // Rate-limit BEFORE parsing the body so a flood of malformed requests
    // can't burn CPU on Zod + JSON.parse. Identifier is the client IP.
    try {
      const ip = getClientIp(await headers());
      await checkRateLimit("orderPlacement", ip);
    } catch (e) {
      if (e instanceof Error && e.message === "RATE_LIMIT_EXCEEDED") {
        return { error: "Too many orders placed recently. Please wait a few minutes and try again." };
      }
      throw e;
    }

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

    // Validate cart payload shape BEFORE doing any DB work.
    // Prevents malformed/hostile payloads (negative qty, non-UUID ids) reaching business logic.
    let parsedCart: z.infer<typeof cartItemSchema>[]
    try {
      const rawCart = JSON.parse(cartItemsStr)
      const result = z.array(cartItemSchema).safeParse(rawCart)
      if (!result.success) {
        return { error: "Invalid cart data. Please refresh and try again." }
      }
      parsedCart = result.data
    } catch {
      return { error: "Invalid cart data. Please refresh and try again." }
    }

    const cartItems = parsedCart

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

      // 1. Verify stock AND securely fetch real prices from the database.
      // Atomic conditional UPDATE prevents overselling under concurrent requests:
      // PostgreSQL guarantees that `UPDATE ... WHERE stock >= qty` either deducts
      // stock (if sufficient) or affects 0 rows (if insufficient). Two concurrent
      // transactions for the last unit cannot both succeed.
      for (const item of cartItems) {
        if (item.variantId) {
          const deducted = await tx.update(productVariants)
            .set({ stock: sql`${productVariants.stock} - ${item.quantity}` })
            .where(and(
              eq(productVariants.id, item.variantId),
              gte(productVariants.stock, item.quantity)
            ))
            .returning({ id: productVariants.id, productId: productVariants.productId })

          if (deducted.length === 0) {
            throw new Error(`Not enough stock available for one of the items in your cart.`)
          }

          // Fetch variant for price/name (price races don't affect correctness).
          const variant = await tx.query.productVariants.findFirst({
            where: eq(productVariants.id, item.variantId),
            with: { product: true }
          })

          if (!variant) {
            // Variant was deleted between deduction and lookup. Roll back by throwing.
            throw new Error(`Item in your cart is no longer available.`)
          }

          const realPrice = Number(variant.product.basePrice); // priceOverride not fully implemented yet
          calculatedSubtotal += realPrice * item.quantity;

          verifiedItems.push({
            productId: variant.productId,
            variantId: variant.id,
            productName: variant.product.name,
            variantName: variant.color || variant.name,
            quantity: item.quantity,
            priceAtPurchase: realPrice.toString()
          });

        } else {
          const deducted = await tx.update(products)
            .set({ stock: sql`${products.stock} - ${item.quantity}` })
            .where(and(
              eq(products.id, item.productId),
              gte(products.stock, item.quantity)
            ))
            .returning({ id: products.id })

          if (deducted.length === 0) {
            throw new Error(`Not enough stock available for one of the items in your cart.`)
          }

          const product = await tx.query.products.findFirst({
            where: eq(products.id, item.productId)
          })

          if (!product) {
            throw new Error(`Item in your cart is no longer available.`)
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
        }
      }

      // Re-verify Shipping Cost from DB
      const zone = await tx.query.shippingZones.findFirst({
        where: eq(shippingZones.id, shippingZoneId)
      });
      if (!zone) throw new Error("Invalid shipping zone");
      
      const realShippingCost = Number(zone.baseRate);
      const realGrandTotal = calculatedSubtotal + realShippingCost;

      // Generate a collision-resistant order number.
      // 8 hex chars from crypto.randomUUID() yields ~4.29B possible values;
      // collision probability is negligible at any realistic order volume.
      const orderNum = `ORD-${crypto.randomUUID().replace(/-/g, "").toUpperCase().slice(0, 8)}`

      // Append sender number to notes if provided
      const finalNotes = senderNumber ? `${orderNotes || ""}\n[Payment Sender: ${senderNumber}]`.trim() : orderNotes;

      // 2. Create the Order securely
      const [newOrder] = await tx.insert(orders).values({
        userId: null,
        orderNumber: orderNum,
        status: "pending",
        // Both manual and COD start as "pending". Admin verifies manual after TrxID;
        // COD is verified at point of delivery (status moves to "processing"/"shipped").
        paymentStatus: "pending",
        paymentMethod: paymentMethod,
        transactionId: transactionId ? (senderNumber ? `[${senderNumber}] ${transactionId}` : transactionId) : null,
        customerName,
        customerPhone,
        // Null when guest omits email (column was made nullable in migration 0004).
        customerEmail: customerEmail || null,
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

  } catch (error: unknown) {
    console.error("Order creation failed:", error)
    const message = error instanceof Error ? error.message : "Failed to create order. Please try again."
    return { error: message }
  }
}
