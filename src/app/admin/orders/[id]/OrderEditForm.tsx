"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateOrderDetailsAction } from "./actions"
import { Loader2 } from "lucide-react"
import { SteadfastCourierCard } from "./SteadfastCourierCard"

export function OrderEditForm({ order }: { order: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddressLine1: order.shippingAddressLine1,
    shippingAddressLine2: order.shippingAddressLine2 || "",
    customerNotes: order.customerNotes || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateOrderDetailsAction(order.id, formData)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Failed to update order details")
    }
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Left Column: Editable Details */}
      <div className="md:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold">Customer & Shipping Info</h2>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              Save Changes
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name</label>
              <input 
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <input 
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address Line 1</label>
            <input 
              name="shippingAddressLine1"
              value={formData.shippingAddressLine1}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address Line 2</label>
            <input 
              name="shippingAddressLine2"
              value={formData.shippingAddressLine2}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Notes / Internal Notes</label>
            <textarea 
              name="customerNotes"
              value={formData.customerNotes}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none resize-none"
            />
          </div>
        </form>

        {/* Read Only Items List */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold border-b pb-4 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  {item.variantName && <p className="text-sm text-muted-foreground">{item.variantName}</p>}
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">৳{item.priceAtPurchase} x {item.quantity}</p>
                  <p className="font-bold">৳{(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Read Only Summary */}
      <div className="space-y-6">
        <div className="bg-muted/30 border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold border-b pb-3">Financial Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>৳{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping ({order.shippingCity})</span>
            <span>৳{order.shippingCost}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-3">
            <span>Total</span>
            <span className="text-primary">৳{order.total}</span>
          </div>
        </div>

        <div className="bg-muted/30 border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold border-b pb-3">Status</h2>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Fulfillment</p>
            <p className="capitalize font-medium">{order.status}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Payment</p>
            <p className="capitalize font-medium">{order.paymentStatus}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Payment Method</p>
            <p className="capitalize font-medium">{order.paymentMethod.replace(/_/g, ' ')}</p>
          </div>
          {order.transactionId && (
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Transaction ID</p>
              <p className="font-mono text-sm">{order.transactionId}</p>
            </div>
          )}
        </div>

        <SteadfastCourierCard order={order} />
      </div>

    </div>
  )
}
