import { db } from "@/db"
import { shippingZones, siteSettings } from "@/db/schema"
import { CheckoutForm } from "@/components/storefront/CheckoutForm"
import { eq } from "drizzle-orm"

export default async function CheckoutPage() {
  const zones = await db.query.shippingZones.findMany({
    where: eq(shippingZones.isActive, true),
    orderBy: (sz, { asc }) => [asc(sz.zoneName)]
  })
  
  const paymentSettings = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, "payment_methods")
  })
  
  const paymentMethods = (paymentSettings?.value as any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your order details below.</p>
      </div>
      
      <CheckoutForm shippingZones={zones} paymentMethods={paymentMethods} />
    </div>
  )
}
