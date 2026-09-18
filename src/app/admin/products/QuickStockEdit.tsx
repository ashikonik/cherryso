"use client"

import { useState } from "react"
import { quickUpdateStock } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit2 } from "lucide-react"

export function QuickStockEdit({ product }: { product: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [baseStock, setBaseStock] = useState(product.stock)
  const [variantsStock, setVariantsStock] = useState<Record<string, number>>(
    product.variants?.reduce((acc: any, v: any) => ({ ...acc, [v.id]: v.stock }), {}) || {}
  )

  const hasVariants = product.variants?.length > 0
  
  // Calculate total display stock for the badge in the table
  const totalDisplayStock = hasVariants 
    ? product.variants.reduce((sum: number, v: any) => sum + v.stock, 0)
    : product.stock

  async function handleSave() {
    setLoading(true)
    const variantsPayload = Object.keys(variantsStock).map(id => ({
      id,
      stock: variantsStock[id]
    }))
    
    await quickUpdateStock(product.id, baseStock, variantsPayload)
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded-md transition-colors w-full group">
        <span className={totalDisplayStock < 5 ? "text-destructive font-bold" : "font-medium"}>
          {totalDisplayStock} {hasVariants && <span className="text-[10px] text-muted-foreground ml-1">in {product.variants.length} vars</span>}
        </span>
        <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Edit Stock</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {!hasVariants ? (
            <div className="space-y-2">
              <Label>Base Stock</Label>
              <Input 
                type="number" 
                min="0" 
                value={baseStock} 
                onChange={e => setBaseStock(Math.max(0, parseInt(e.target.value) || 0))} 
              />
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <p className="text-sm text-muted-foreground">This product uses variants. Update stock per variant.</p>
              {product.variants.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between gap-4 p-3 border rounded-xl bg-muted/20">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{v.name}</p>
                    {v.color && <p className="text-xs text-muted-foreground">Color: {v.color}</p>}
                  </div>
                  <div className="w-24">
                    <Input 
                      type="number" 
                      min="0" 
                      value={variantsStock[v.id]} 
                      onChange={e => setVariantsStock({ ...variantsStock, [v.id]: Math.max(0, parseInt(e.target.value) || 0) })} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
