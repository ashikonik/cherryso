"use client"

import { useState } from "react"
import { updateOrderShippingAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2 } from "lucide-react"

export function QuickShippingEdit({ orderId, currentCity, currentCost, shippingZones }: { 
  orderId: string, 
  currentCity: string, 
  currentCost: string, 
  shippingZones: any[] 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedZone, setSelectedZone] = useState<string>("")

  async function handleSave() {
    if (!selectedZone) return
    const zone = shippingZones.find(z => z.id === selectedZone)
    if (!zone) return

    setLoading(true)
    await updateOrderShippingAction(orderId, Number(zone.baseRate), zone.zoneName)
    setLoading(false)
    setOpen(false)
  }

  const activeZone = shippingZones.find(z => z.id === selectedZone)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1 group text-xs text-muted-foreground hover:text-foreground">
        <span>{currentCity} (৳{currentCost})</span>
        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Shipping Area</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>New Shipping Area</Label>
            <Select value={selectedZone} onValueChange={(v) => setSelectedZone(v || "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select correct area">
                  {(val: string | null) => {
                    if (!val) return <span className="text-muted-foreground">Select correct area</span>;
                    const zone = shippingZones.find(z => z.id === val);
                    if (!zone) return <span className="text-muted-foreground">Select correct area</span>;
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
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !selectedZone}>
            {loading ? "Saving..." : "Update Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
