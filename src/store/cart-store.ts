import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface CartItem {
  id: string // unique ID for the cart item (usually variantId or productId)
  productId: string
  variantId: string | null
  name: string
  color: string | null
  price: number
  quantity: number
  maxStock: number
  image: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem: CartItem) => {
        const currentItems = get().items
        const existingItemIndex = currentItems.findIndex(i => i.id === newItem.id)
        
        if (existingItemIndex > -1) {
          // If item already exists, increase quantity up to maxStock
          const updatedItems = [...currentItems]
          const existingItem = updatedItems[existingItemIndex]
          const newQuantity = Math.min(existingItem.quantity + newItem.quantity, existingItem.maxStock)
          
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity
          }
          
          set({ items: updatedItems })
        } else {
          // New item
          set({ items: [...currentItems, newItem] })
        }
      },
      
      removeItem: (id: string) => {
        set({ items: get().items.filter(i => i.id !== id) })
      },
      
      updateQuantity: (id: string, quantity: number) => {
        set({
          items: get().items.map(item => {
            if (item.id === id) {
              return { ...item, quantity: Math.min(Math.max(1, quantity), item.maxStock) }
            }
            return item
          })
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      getCartTotal: () => {
        const total = get().items.reduce((sum, item) => {
          const price = Number(item.price) || 0
          const qty = Number(item.quantity) || 1
          return sum + (price * qty)
        }, 0)
        return Number(total.toFixed(2)) || 0
      },
      
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: "cherryso-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
