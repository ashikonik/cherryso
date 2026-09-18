import { db } from "@/db"
import { orders, orderItems } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth-utils"
import { notFound } from "next/navigation"
import { PrintButton } from "./PrintButton"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Bar - Hidden on Print */}
      <div className="print:hidden flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <Link href="/admin/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <PrintButton />
      </div>

      {/* Printable Invoice Paper */}
      <div className="bg-white p-10 md:p-16 rounded-xl border shadow-sm print:border-none print:shadow-none print:p-0 relative overflow-hidden">
        
        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-[#C9184A] via-[#FF4D6D] to-[#FF8FAB]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-8 mb-8 mt-6">
          <div>
            <h1 className="text-4xl font-black text-[#C9184A] tracking-tighter">🍒 CherrySo</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Your reliable shopping partner.</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black bg-gradient-to-br from-[#C9184A] to-[#FF8FAB] bg-clip-text text-transparent uppercase tracking-widest mb-2" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>Invoice</h2>
            <p className="font-mono font-bold text-foreground text-lg">{order.orderNumber}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Info Blocks */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Billed To</h3>
            <p className="font-bold text-slate-900 text-lg">{order.customerName}</p>
            <p className="text-slate-600">{order.customerPhone}</p>
            {order.customerEmail && order.customerEmail !== "guest@example.com" && (
              <p className="text-slate-600">{order.customerEmail}</p>
            )}
            <div className="mt-4 text-slate-900">
              <p>{order.shippingAddressLine1}</p>
              {order.shippingAddressLine2 && <p>{order.shippingAddressLine2}</p>}
              <p>{order.shippingCity}, {order.shippingPostalCode}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Info</h3>
              <p className="font-medium text-slate-900 capitalize">Method: {order.paymentMethod.replace(/_/g, ' ')}</p>
              <p className="text-slate-600">Status: <span className="font-semibold text-slate-900">{order.paymentStatus}</span></p>
              {order.transactionId && <p className="text-slate-500 font-mono text-sm mt-1">Trx: {order.transactionId}</p>}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Status</h3>
              <p className="font-medium text-slate-900 capitalize">{order.status}</p>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <table className="w-full mb-8 text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-[#C9184A]/20">
              <th className="py-3 font-bold text-slate-800">Item Description</th>
              <th className="py-3 font-bold text-slate-800 text-center">Qty</th>
              <th className="py-3 font-bold text-slate-800 text-right">Price</th>
              <th className="py-3 font-bold text-slate-800 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9184A]/10">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-4">
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  {item.variantName && <p className="text-sm text-slate-500">{item.variantName}</p>}
                </td>
                <td className="py-4 text-center text-slate-800">{item.quantity}</td>
                <td className="py-4 text-right text-slate-800">৳{item.priceAtPurchase}</td>
                <td className="py-4 text-right font-medium text-slate-900">৳{(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-4">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">৳{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-medium text-slate-900">৳{order.shippingCost}</span>
            </div>
            {Number(order.discountTotal) > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount</span>
                <span>-৳{order.discountTotal}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-black text-[#C9184A] border-t-2 border-[#C9184A]/20 pt-4 mt-2">
              <span>Total</span>
              <span>৳{order.total}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        {order.customerNotes && (
          <div className="mt-12 p-4 bg-slate-50 rounded-lg print:bg-transparent print:border print:p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Customer Notes:</h3>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{order.customerNotes}</p>
          </div>
        )}
        
        <div className="mt-16 text-center text-sm text-slate-500 print:mt-24 border-t pt-8">
          Thank you for your business! <br />
          If you have any questions about this invoice, please contact us.
        </div>

      </div>
    </div>
  )
}
