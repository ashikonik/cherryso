import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"

export default async function CheckoutSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId)
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center max-w-md">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-8">
        Thank you for shopping with CherrySo. Your order <strong>#{order.id.slice(0, 8)}</strong> has been successfully placed.
      </p>

      <div className="w-full bg-muted/50 p-6 rounded-2xl border mb-8 text-left space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="font-semibold capitalize">{order.status.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment</span>
          <span className="font-semibold capitalize">{order.paymentStatus.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between pt-3 border-t">
          <span className="font-semibold">Grand Total</span>
          <span className="font-bold text-primary text-base">৳{order.total}</span>
        </div>
      </div>

      <Link href="/" className={buttonVariants({ className: "w-full rounded-full h-12 text-lg" })}>
        Continue Shopping
      </Link>
    </div>
  )
}
