import { db } from "@/db"
import { siteSettings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { PaymentSettingsClient } from "./PaymentSettingsClient"
import { requireAdmin } from "@/lib/auth-utils"

export default async function PaymentSettingsPage() {
  await requireAdmin()
  
  const paymentSettings = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, "payment_methods")
  })
  
  const paymentMethods = paymentSettings?.value || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Payment Methods</h1>
        <p className="text-muted-foreground">Enable, disable, and configure your store's payment methods.</p>
      </div>
      
      <PaymentSettingsClient initialMethods={paymentMethods as any[]} />
    </div>
  )
}
