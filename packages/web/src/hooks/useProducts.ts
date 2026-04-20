import { useState, useCallback, useEffect } from 'react'
import { productService, type Product, type CreateProductInput, type UpdateProductInput } from '@/services/products'

interface UseProductsState {
  products: Product[]
  loading: boolean
  error: Error | null
}

export function useProducts() {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    loading: true,
    error: null,
  })

  // Récupérer tous les produits
  const fetchProducts = useCallback(async (filters?: { category?: string; search?: string }) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = (await productService.getAll(filters)) as any
      const products = Array.isArray(response) ? response : response?.data || []
      setState({ products: products as Product[], loading: false, error: null })
      return products
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }))
      throw error
    }
  }, [])

  // Récupérer un produit par ID
  const getProductById = useCallback(async (id: string) => {
    try {
      const response = (await productService.getById(id)) as any
      const product = response?.data || response
      return product as Product
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }))
      throw error
    }
  }, [])

  // Créer un produit
  const createProduct = useCallback(async (data: CreateProductInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = (await productService.create(data)) as any
      const newProduct = response?.data || response
      setState((prev) => ({
        ...prev,
        products: [...prev.products, newProduct as Product],
        loading: false,
        error: null,
      }))
      return newProduct
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }))
      throw error
    }
  }, [])

  // Modifier un produit
  const updateProduct = useCallback(async (id: string, data: UpdateProductInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = (await productService.update(id, data)) as any
      const updatedProduct = response?.data || response
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === id ? (updatedProduct as Product) : p
        ),
        loading: false,
        error: null,
      }))
      return updatedProduct
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }))
      throw error
    }
  }, [])

  // Supprimer un produit
  const deleteProduct = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await productService.delete(id)
      setState((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id),
        loading: false,
        error: null,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }))
      throw error
    }
  }, [])

  // Au chargement, récupérer tous les produits
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    ...state,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}

export default useProducts