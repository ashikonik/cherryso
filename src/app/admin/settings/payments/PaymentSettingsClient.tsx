"use client"

import { useState } from "react"
import { savePaymentMethodsAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

export function PaymentSettingsClient({ initialMethods }: { initialMethods: any[] }) {
  const [methods, setMethods] = useState<any[]>(initialMethods)
  const [loading, setLoading] = useState(false)

  const toggleMethod = (id: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m))
  }

  const updateInstructions = (id: string, instructions: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, instructions } : m))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await savePaymentMethodsAction(methods)
      if (res.success) {
        toast.success("Payment methods updated!")
      }
    } catch (e) {
      toast.error("Failed to save.")
    } finally {
      setLoading(false)
    }
  }

  const addMethod = () => {
    const newId = `method_${Date.now()}`
    setMethods([...methods, {
      id: newId,
      name: "New Payment Method",
      type: "manual",
      isActive: true,
      instructions: "Enter instructions here..."
    }])
  }

  const removeMethod = (id: string) => {
    if (confirm("Are you sure you want to remove this payment method?")) {
      setMethods(methods.filter(m => m.id !== id))
    }
  }

  const updateMethodName = (id: string, name: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, name } : m))
  }

  return (
    <div className="space-y-6">
      {methods.map(method => (
        <div key={method.id} className={`p-6 border rounded-2xl transition-colors ${method.isActive ? "bg-card" : "bg-muted/50"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 max-w-xs">
              {['bkash', 'nagad', 'cash_on_delivery'].includes(method.id) ? (
                <h3 className="text-lg font-semibold">{method.name}</h3>
              ) : (
                <Input 
                  value={method.name} 
                  onChange={e => updateMethodName(method.id, e.target.value)} 
                  className="font-semibold text-lg h-9 mb-1" 
                />
              )}
              <p className="text-sm text-muted-foreground">Type: <span className="uppercase font-mono text-[10px] bg-muted/50 px-1 py-0.5 rounded border">{method.type}</span></p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{method.isActive ? "Enabled" : "Disabled"}</span>
                <Switch checked={method.isActive} onCheckedChange={() => toggleMethod(method.id)} />
              </div>
              {!['bkash', 'nagad', 'cash_on_delivery'].includes(method.id) && (
                <Button variant="destructive" size="sm" onClick={() => removeMethod(method.id)}>Remove</Button>
              )}
            </div>
          </div>
          
          {method.type === 'manual' && (
            <div className="space-y-2">
              <Label>Payment Instructions (shown to customer at checkout)</Label>
              <Textarea 
                value={method.instructions} 
                onChange={e => updateInstructions(method.id, e.target.value)}
                rows={5}
                className="font-mono text-sm bg-muted/20"
                disabled={!method.isActive}
              />
            </div>
          )}
        </div>
      ))}
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={addMethod}>+ Add Payment Method</Button>
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
