import { db } from "@/db"
import { orders, shippingZones } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { QuickOrderConfirm } from "../QuickOrderConfirm"
import { QuickShippingEdit } from "./QuickShippingEdit"
import { QuickPaymentEdit } from "./QuickPaymentEdit"
import { requireAdmin } from "@/lib/auth-utils"
import Link from "next/link"

export default async function AdminOrdersPage() {
  await requireAdmin()
  
  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
  })

  const zones = await db.query.shippingZones.findMany({
    where: eq(shippingZones.isActive, true)
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Orders</h1>
          <p className="text-muted-foreground">Manage and fulfill all customer orders.</p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">Order ID</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Customer</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Shipping Area</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Total</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-center">Payment</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-right">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/orders/${order.id}`} className="font-semibold text-foreground hover:text-primary transition-colors hover:underline">
                        {order.orderNumber}
                      </Link>
                      <a href={`/admin/orders/${order.id}/invoice`} target="_blank" className="text-muted-foreground hover:text-primary ml-1" title="Print Invoice">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                      </a>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <QuickShippingEdit 
                      orderId={order.id}
                      currentCity={order.shippingCity}
                      currentCost={order.shippingCost}
                      shippingZones={zones}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-primary">৳{order.total}</p>
                    {order.paymentMethod === 'bkash' && <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">bKash</span>}
                    {order.paymentMethod === 'nagad' && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Nagad</span>}
                    {order.paymentMethod === 'cash_on_delivery' && <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">COD</span>}
                    {order.transactionId && (
                      <p className="text-[9px] text-muted-foreground mt-1 font-mono bg-muted/50 inline-block px-1 rounded border">
                        {order.transactionId}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <QuickPaymentEdit orderId={order.id} currentStatus={order.paymentStatus} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <QuickOrderConfirm orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))}
              
              {allOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
