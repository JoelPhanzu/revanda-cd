import { create } from 'zustand'

export interface CartItem {
  id: string
  lineId?: string
  name: string
  price: number
  image: string
  stock: number
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

export type ProductOption = {
  colors: string[]
  sizes: string[]
}

interface CartStore {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'quantity' | 'lineId'> & { quantity?: number }) => void
  removeItem: (lineId: string) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clearCart: () => void
}

const getTotals = (items: CartItem[]) => ({
  itemCount: items.reduce((total, item) => total + item.quantity, 0),
  subtotal: items.reduce((total, item) => total + item.quantity * item.price, 0),
})

const createLineId = (item: Pick<CartItem, 'id' | 'selectedColor' | 'selectedSize'>) =>
  `${item.id}::${item.selectedColor || ''}::${item.selectedSize || ''}`

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,
  addItem: (item) =>
    set((state) => {
      const lineId = createLineId(item)
      const existing = state.items.find((current) => current.lineId === lineId)
      const requestedQuantity = Math.max(1, item.quantity || 1)
      const items = existing
        ? state.items.map((current) =>
            current.lineId === lineId
              ? { ...current, quantity: Math.min(current.quantity + requestedQuantity, current.stock) }
              : current
          )
        : [...state.items, { ...item, lineId, quantity: Math.min(requestedQuantity, item.stock) }]
      return { items, ...getTotals(items) }
    }),
  removeItem: (lineId) =>
    set((state) => {
      const items = state.items.filter((item) => item.lineId !== lineId)
      return { items, ...getTotals(items) }
    }),
  updateQuantity: (lineId, quantity) =>
    set((state) => {
      const items = state.items.map((item) =>
        item.lineId === lineId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item
      )
      return { items, ...getTotals(items) }
    }),
  clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),
}))

export default useCartStore
