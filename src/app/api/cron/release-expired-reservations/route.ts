import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, productVariants, products } from "@/db/schema";
import { and, eq, isNotNull, lt, sql, inArray } from "drizzle-orm";
import { checkCronAuth } from "@/lib/cron-auth";

/**
 * Scheduled endpoint: releases expired stock reservations.
 *
 * Background:
 *   When an order is created with a manual bank transfer or pending TrxID,
 *   `orders.stockReserved = true` and `orders.reservedUntil` is set. If the
 *   admin never confirms the payment, the reserved stock must be returned to
 *   inventory so other shoppers can buy it. Without this job, ghost orders
 *   can lock up the catalog indefinitely.
 *
 * Schedule:
 *   Netlify scheduled function, every 15 minutes. See netlify.toml.
 *   Set CRON_SECRET in the environment and pass it via the
 *   `x-cron-secret` header (Netlify Scheduled Functions do this for us).
 *
 * Idempotency:
 *   The query selects only orders with `stockReserved = true` AND
 *   `reservedUntil < now()`. After processing, `stockReserved = false`, so
 *   a re-run after partial failure will pick up only what remains.
 *
 * Auth:
 *   See lib/cron-auth.ts for the shared auth gate.
 */
export async function POST(request: Request) {
  // 1. Auth gate
  const auth = checkCronAuth(request, process.env.CRON_SECRET);
  if (auth) return auth;

  // 2. Find candidate orders: reservation expired AND not already finalised.
  // Finalised statuses (delivered, shipped, cancelled, refunded) are excluded
  // because their stock accounting is already resolved.
  const expired = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
    })
    .from(orders)
    .where(
      and(
        eq(orders.stockReserved, true),
        isNotNull(orders.reservedUntil),
        lt(orders.reservedUntil, sql`now()`),
        // status NOT IN (...) — Drizzle doesn't expose a `notInArray` helper
        // for this enum without coercion, so we enumerate the "live" statuses.
        // Cancelled/delivered/refunded are not "live" and should never appear
        // here anyway because the order page sets stockReserved=false at that
        // point. Defensive exclusion.
        sql`${orders.status} NOT IN ('delivered', 'shipped', 'cancelled', 'refunded')`
      )
    );

  if (expired.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const orderIds = expired.map((o) => o.id);

  // 3. Restore stock in a single transaction. We restore by joining back to
  // the order items to find the variant / product that was deducted and add
  // the quantity back. If a variant was deleted between order and expiry, we
  // skip it silently — there's nothing to restore.
  const restored = await db.transaction(async (tx) => {
    const items = await tx
      .select({
        productId: orderItems.productId,
        variantId: orderItems.variantId,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    let restoredCount = 0;

    for (const item of items) {
      if (item.variantId) {
        const r = await tx
          .update(productVariants)
          .set({
            stock: sql`${productVariants.stock} + ${item.quantity}`,
          })
          .where(eq(productVariants.id, item.variantId))
          .returning({ id: productVariants.id });
        if (r.length > 0) restoredCount++;
      } else if (item.productId) {
        const r = await tx
          .update(products)
          .set({
            stock: sql`${products.stock} + ${item.quantity}`,
          })
          .where(eq(products.id, item.productId))
          .returning({ id: products.id });
        if (r.length > 0) restoredCount++;
      }
    }

    // Mark orders as no-longer-reserving. We don't change status here —
    // cancelling the order is an admin decision. We only release stock.
    await tx
      .update(orders)
      .set({ stockReserved: false })
      .where(inArray(orders.id, orderIds));

    return restoredCount;
  });

  return NextResponse.json({
    processed: expired.length,
    itemsRestored: restored,
    orderIds,
  });
}
