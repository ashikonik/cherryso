import { db } from "@/db"
import { orders, orderItems } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth-utils"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Printer } from "lucide-react"
import { OrderEditForm } from "./OrderEditForm"

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: true,
    }
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ChevronLeft className="w-4 h-4" /> Back to Orders
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">Manage customer details, shipping, and fulfillment.</p>
        </div>
        <a 
          href={`/admin/orders/${order.id}/invoice`} 
          target="_blank"
          className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print Invoice
        </a>
      </div>

      <OrderEditForm order={order} />
    </div>
  )
}
