import { db } from "@/db"
import { orders, products, userProfiles, roles } from "@/db/schema"
import { sql, eq } from "drizzle-orm"
import { QuickOrderConfirm } from "./QuickOrderConfirm"

export default async function AdminDashboardPage() {
  const [revenueResult] = await db.select({ total: sql<number>`sum(${orders.total})` }).from(orders)
  const [ordersResult] = await db.select({ count: sql<number>`count(*)` }).from(orders)
  const [productsResult] = await db.select({ count: sql<number>`count(*)` }).from(products)
  const [usersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userProfiles)
    .leftJoin(roles, eq(userProfiles.id, roles.userId))
    .where(sql`${roles.role} IS NULL OR ${roles.role} = 'customer'`)

  const totalRevenue = revenueResult?.total || 0
  const totalOrders = ordersResult?.count || 0
  const totalProducts = productsResult?.count || 0
  const totalUsers = usersResult?.count || 0

  const recentOrders = await db.query.orders.findMany({
    orderBy: (o, { desc }) => [desc(o.createdAt)],
    limit: 5
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store&apos;s performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
          <div className="text-2xl font-bold mt-2">৳{Number(totalRevenue).toLocaleString()}</div>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Orders</div>
          <div className="text-2xl font-bold mt-2">{totalOrders}</div>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Products</div>
          <div className="text-2xl font-bold mt-2">{totalProducts}</div>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Registered Customers</div>
          <div className="text-2xl font-bold mt-2">{totalUsers}</div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      {order.orderNumber}
                      {order.paymentMethod === 'bkash' && <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">bKash</span>}
                      {order.paymentMethod === 'nagad' && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Nagad</span>}
                      {order.paymentMethod === 'cash_on_delivery' && <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">COD</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    {order.transactionId && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono bg-muted/30 inline-block px-1 rounded border border-border/50">
                        {order.transactionId}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-semibold text-sm text-primary">৳{order.total}</p>
                    <QuickOrderConfirm orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex items-center justify-center text-muted-foreground h-full min-h-[300px]">
          Sales charts will appear here
        </div>
      </div>
    </div>
  )
}
