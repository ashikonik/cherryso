"use client"

import { useState } from "react"
import { quickUpdateOrderStatus } from "./actions"
import { Loader2 } from "lucide-react"

export function QuickOrderConfirm({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus)

  // Determine colors based on status
  const getColorClasses = (status: string) => {
    switch(status) {
      case 'pending': 
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900'
      case 'processing': 
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900'
      case 'shipped': 
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900'
      case 'delivered': 
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900'
      case 'cancelled': 
      case 'refunded':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        disabled={loading}
        className={`px-2 py-1 pr-6 appearance-none rounded-md text-[10px] uppercase font-bold border focus:ring-2 focus:ring-ring outline-none cursor-pointer transition-colors ${getColorClasses(optimisticStatus)} ${loading ? 'opacity-50' : ''}`}
        value={optimisticStatus}
        onChange={async (e) => {
          const newStatus = e.target.value as any
          setOptimisticStatus(newStatus)
          setLoading(true)
          await quickUpdateOrderStatus(orderId, newStatus)
          setLoading(false)
        }}
      >
        <option value="pending" className="bg-background text-foreground uppercase">Pending</option>
        <option value="processing" className="bg-background text-foreground uppercase">Processing</option>
        <option value="shipped" className="bg-background text-foreground uppercase">Shipped</option>
        <option value="delivered" className="bg-background text-foreground uppercase">Delivered</option>
        <option value="cancelled" className="bg-background text-foreground uppercase">Cancelled</option>
        <option value="refunded" className="bg-background text-foreground uppercase">Refunded</option>
      </select>
      
      {/* Custom dropdown arrow or loader */}
      <div className="absolute right-1.5 pointer-events-none flex items-center justify-center">
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin text-current opacity-70" />
        ) : (
          <svg className="w-3 h-3 text-current opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  )
}
