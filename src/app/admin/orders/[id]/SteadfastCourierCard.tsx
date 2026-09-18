"use client"

import { useState } from "react"
import { createSteadfastConsignmentAction } from "./steadfast-actions"
import { Loader2, Truck, ExternalLink, AlertCircle } from "lucide-react"

export function SteadfastCourierCard({ order }: { order: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendToCourier = async () => {
    if (!confirm("Are you sure you want to send this order to Steadfast Courier? This will create a live consignment.")) return
    
    setLoading(true)
    setError("")
    try {
      await createSteadfastConsignmentAction(order.id)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    }
    setLoading(false)
  }

  const isSent = !!order.courierConsignmentId

  return (
    <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-primary/5 border-b p-4 flex items-center gap-2">
        <Truck className="w-5 h-5 text-primary" />
        <h2 className="font-bold">Steadfast Courier</h2>
      </div>
      
      <div className="p-6 space-y-4">
        {isSent ? (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm font-medium border border-green-200">
              Consignment successfully created!
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Consignment ID</p>
              <p className="font-mono">{order.courierConsignmentId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Tracking Code</p>
              <p className="font-mono mb-2">{order.courierTrackingUrl}</p>
              <a 
                href={`https://steadfast.com.bd/t/${order.courierTrackingUrl}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
              >
                Track Parcel <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This order has not been sent to Steadfast yet. Clicking below will automatically create a parcel with the customer's details and set the COD amount to <strong>৳{order.paymentStatus === 'paid' ? '0 (Paid)' : order.total}</strong>.
            </p>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSendToCourier}
              disabled={loading}
              className="w-full bg-[#E52A3D] hover:bg-[#c9182b] text-white py-2.5 rounded-md font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Truck className="w-5 h-5" />
              )}
              {loading ? "Creating Consignment..." : "Send to Steadfast"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
