"use client"

import { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOrderAction } from "@/app/(storefront)/checkout/actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CheckoutForm({ shippingZones, paymentMethods = [] }: { shippingZones: any[], paymentMethods?: any[] }) {
  const [mounted, setMounted] = useState(false)
  const cart = useCartStore()
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>(paymentMethods.find((p: any) => p.isActive)?.id || "cash_on_delivery")
  
  const selectedZone = shippingZones.find(z => z.id === selectedZoneId)
  const shippingCost = selectedZone ? Number(selectedZone.baseRate) || 0 : 0
  const subtotal = Number(cart.getCartTotal()) || 0
  const grandTotal = Number((subtotal + shippingCost).toFixed(2)) || 0

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
        <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append("shippingZoneId", selectedZoneId)
    formData.append("cartItems", JSON.stringify(cart.items))
    formData.append("paymentMethod", paymentMethod)
    
    const result = await createOrderAction(formData)
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else if (result.success && result.orderId) {
      cart.clearCart()
      router.push(`/checkout/success/${result.orderId}`)
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Left: Form */}
      <div className="md:col-span-2">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name *</Label>
                <Input id="customerName" name="customerName" required placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input 
                  id="customerPhone" 
                  name="customerPhone" 
                  required 
                  placeholder="01XXXXXXXXX or +8801XXXXXXXXX" 
                  pattern="^(?:\+8801|8801|01)[3-9]\d{8}$"
                  title="Please enter a valid Bangladeshi phone number"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customerEmail">Email Address (Optional)</Label>
                <Input id="customerEmail" name="customerEmail" type="email" placeholder="jane@example.com" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shippingZone">Shipping Area *</Label>
                <Select value={selectedZoneId} onValueChange={(v) => setSelectedZoneId(v || "")} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your shipping area">
                      {(val: string | null) => {
                        if (!val) return <span className="text-muted-foreground">Select your shipping area</span>;
                        const zone = shippingZones.find(z => z.id === val);
                        if (!zone) return <span className="text-muted-foreground">Select your shipping area</span>;
                        return `${zone.zoneName} ${Number(zone.baseRate) > 0 ? `(৳${zone.baseRate})` : '(Calculated later)'}`;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {shippingZones.map(zone => (
                      <SelectItem 
                        key={zone.id} 
                        value={zone.id} 
                        label={`${zone.zoneName} ${Number(zone.baseRate) > 0 ? `(৳${zone.baseRate})` : '(Calculated later)'}`}
                      >
                        {zone.zoneName} {Number(zone.baseRate) > 0 ? `(৳${zone.baseRate})` : '(Calculated later)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shippingAddress">Full Address *</Label>
                <Input id="shippingAddress" name="shippingAddress" required placeholder="House 1, Road 2, Block A, Mirpur" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="orderNotes">Special Instructions (Optional)</Label>
                <Input id="orderNotes" name="orderNotes" placeholder="E.g., Please call before delivery" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Payment Method</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {paymentMethods.filter(p => p.isActive).map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === pm.id 
                        ? (pm.id === "bkash" ? "border-pink-600 bg-pink-50 ring-2 ring-pink-600/20 dark:bg-pink-950/20" : 
                           pm.id === "nagad" ? "border-orange-600 bg-orange-50 ring-2 ring-orange-600/20 dark:bg-orange-950/20" : 
                           "border-primary bg-primary/5 ring-2 ring-primary/20") 
                        : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <span className={`font-semibold text-sm ${
                      pm.id === "bkash" ? "text-pink-600 dark:text-pink-400" :
                      pm.id === "nagad" ? "text-orange-600 dark:text-orange-400" :
                      ""
                    }`}>{pm.name}</span>
                  </button>
                ))}
              </div>

              {paymentMethods.filter(p => p.isActive).map(pm => {
                if (paymentMethod !== pm.id) return null;
                if (pm.type !== 'manual') return null; // COD doesn't need instructions
                
                return (
                  <div key={`instructions-${pm.id}`} className={`p-4 border rounded-xl space-y-4 mt-4 animate-in fade-in slide-in-from-top-2 ${
                    pm.id === "bkash" ? "bg-pink-50/50 dark:bg-pink-950/10 border-pink-100 dark:border-pink-900" :
                    pm.id === "nagad" ? "bg-orange-50/50 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900" :
                    "bg-muted/30 border-border"
                  }`}>
                    <div className="text-sm">
                      <p className={`font-medium mb-2 ${
                        pm.id === "bkash" ? "text-pink-800 dark:text-pink-300" :
                        pm.id === "nagad" ? "text-orange-800 dark:text-orange-300" :
                        "text-foreground"
                      }`}>{pm.name} Instructions:</p>
                      <div className="whitespace-pre-line text-muted-foreground ml-2">
                        {pm.instructions}
                      </div>
                      <div className="mt-2 text-muted-foreground ml-2">
                        Amount to send: <strong>৳{grandTotal.toFixed(2)}</strong>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="senderNumber">Your {pm.name} Number *</Label>
                        <Input id="senderNumber" name="senderNumber" required placeholder="01XXXXXXXXX" pattern="^(?:\+8801|8801|01)[3-9]\d{8}$" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transactionId">Transaction ID (TrxID) *</Label>
                      <Input id="transactionId" name="transactionId" required placeholder="e.g. 8N7A6B5C4D" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </form>
      </div>

      {/* Right: Summary */}
      <div>
        <div className="bg-card border rounded-2xl p-6 shadow-sm sticky top-24">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            {cart.items.map((item) => {
              const itemPrice = Number(item.price) || 0;
              const itemQty = Number(item.quantity) || 1;
              return (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 flex-1 pr-2">
                    <span className="font-semibold text-muted-foreground">{itemQty}x</span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="font-medium">৳{(itemPrice * itemQty).toFixed(2)}</span>
                </div>
              )
            })}
          </div>

          <div className="space-y-2 border-t pt-4 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {!selectedZoneId 
                  ? "Select area" 
                  : shippingCost > 0 
                    ? `৳${shippingCost.toFixed(2)}` 
                    : "To be determined"
                }
              </span>
            </div>
          </div>

          <div className="flex justify-between border-t pt-4 mb-6 text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">৳{grandTotal.toFixed(2)}</span>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            form="checkout-form" 
            className="w-full h-12 text-lg rounded-full"
            disabled={isSubmitting || !selectedZoneId}
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  )
}
