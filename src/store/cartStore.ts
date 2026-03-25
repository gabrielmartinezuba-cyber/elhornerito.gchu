import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types/database'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id)
          if (existing) {
            // Validar stock antes de sumar
            if (existing.quantity >= product.stock_quantity) return state

            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }
          // Si el producto no tiene stock, no añadir
          if (product.stock_quantity <= 0) return state

          return { items: [...state.items, { product, quantity: 1 }] }
        })
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },
      
      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.product.id !== productId),
            }
          }
          
          const item = state.items.find(i => i.product.id === productId)
          if (!item) return state

          // Validar stock: quantity no puede superar product.stock_quantity
          const finalQty = Math.min(quantity, item.product.stock_quantity)

          return {
            items: state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity: finalQty } : item
            ),
          }
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: 'hornerito-cart-storage',
    }
  )
)
