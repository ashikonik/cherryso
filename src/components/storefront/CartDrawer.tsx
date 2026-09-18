"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { useCartStore } from "@/store/cart-store"
import Link from "next/link"

export function CartDrawer() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const cart = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}>
        <ShoppingBag className="h-5 w-5" />
      </div>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <div className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}>
          <ShoppingBag className="h-5 w-5" />
          {cart.getCartCount() > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {cart.getCartCount()}
            </span>
          )}
          <span className="sr-only">Cart</span>
        </div>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background/95 backdrop-blur-xl">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" /> 
            Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-hide">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <ShoppingBag className="h-16 w-16 opacity-20" />
              <p className="text-lg font-medium">Your cart is empty.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-card border border-border rounded-2xl shadow-sm">
                  <div className="w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-muted">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-1 py-1 justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground line-clamp-1">{item.name}</h4>
                        {item.color && (
                          <p className="text-xs text-muted-foreground mt-0.5">Color: {item.color}</p>
                        )}
                        <p className="text-primary font-bold text-sm mt-1">৳{item.price}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => cart.removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-full overflow-hidden bg-background">
                        <button 
                          disabled={item.quantity <= 1}
                          onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                        <button 
                          disabled={item.quantity >= item.maxStock}
                          onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      {item.quantity >= item.maxStock && (
                         <span className="text-[10px] text-destructive">Max Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <SheetFooter className="border-t border-border pt-6 pb-2 flex-col gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-muted-foreground">Subtotal</span>
              <span className="text-xl font-bold text-foreground">৳{cart.getCartTotal()}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">Shipping & taxes calculated at checkout.</p>
            <Link href="/checkout" onClick={() => setIsOpen(false)} className={buttonVariants({ className: "w-full rounded-full h-12 text-lg font-bold" })}>
              Checkout securely
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
