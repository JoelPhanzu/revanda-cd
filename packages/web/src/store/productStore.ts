import { create } from 'zustand'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  images?: string[]
  category: string
  stock: number
  vendorId: string
  vendorName?: string
  colors?: string[]
  sizes?: string[]
  createdAt: string
  updatedAt: string
}

interface ProductStore {
  // State
  products: Product[]
  selectedProduct: Product | null
  filters: {
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
  }
  isLoading: boolean

  // Actions
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  setSelectedProduct: (product: Product | null) => void
  setFilters: (filters: Partial<ProductStore['filters']>) => void
  setIsLoading: (isLoading: boolean) => void
  clearFilters: () => void
}

export const useProductStore = create<ProductStore>((set) => ({
  // Initial state
  products: [],
  selectedProduct: null,
  filters: {},
  isLoading: false,

  // Actions
  setProducts: (products: Product[]) => set({ products }),

  addProduct: (product: Product) =>
    set((state) => ({ products: [...state.products, product] })),

  updateProduct: (id: string, product: Partial<Product>) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...product } : p
      ),
    })),

  deleteProduct: (id: string) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  setSelectedProduct: (product: Product | null) =>
    set({ selectedProduct: product }),

  setFilters: (filters: Partial<ProductStore['filters']>) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  clearFilters: () => set({ filters: {} }),
}))

export default useProductStore
