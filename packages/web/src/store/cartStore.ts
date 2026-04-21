import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  stock: number
  quantity: number
}

interface CartStore {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const getTotals = (items: CartItem[]) => ({
  itemCount: items.reduce((total, item) => total + item.quantity, 0),
  subtotal: items.reduce((total, item) => total + item.quantity * item.price, 0),
})

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((current) => current.id === item.id)
      const items = existing
        ? state.items.map((current) =>
            current.id === item.id
              ? { ...current, quantity: Math.min(current.quantity + 1, current.stock) }
              : current
          )
        : [...state.items, { ...item, quantity: 1 }]
      return { items, ...getTotals(items) }
    }),
  removeItem: (id) =>
    set((state) => {
      const items = state.items.filter((item) => item.id !== id)
      return { items, ...getTotals(items) }
    }),
  updateQuantity: (id, quantity) =>
    set((state) => {
      const items = state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item
      )
      return { items, ...getTotals(items) }
    }),
  clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),
}))

export default useCartStore
