"use client"

import { useState } from "react"
import { quickUpdatePaymentStatus } from "./actions"
import { Loader2 } from "lucide-react"

export function QuickPaymentEdit({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus)

  // Determine colors based on payment status
  const getColorClasses = (status: string) => {
    switch(status) {
      case 'pending': 
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900'
      case 'paid': 
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900'
      case 'failed': 
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
          const newStatus = e.target.value as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
          setOptimisticStatus(newStatus)
          setLoading(true)
          await quickUpdatePaymentStatus(orderId, newStatus)
          setLoading(false)
        }}
      >
        <option value="pending" className="bg-background text-foreground uppercase">Pending</option>
        <option value="paid" className="bg-background text-foreground uppercase">Paid</option>
        <option value="failed" className="bg-background text-foreground uppercase">Failed</option>
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
