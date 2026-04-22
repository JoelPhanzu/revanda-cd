import {apiClient} from './api'

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

export interface CreateProductInput {
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  colors?: string[]
  sizes?: string[]
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export const productService = {
  // GET - Récupérer tous les produits
  getAll: (filters?: { category?: string; search?: string }) =>
    apiClient.get('/products', { params: filters }),

  // GET - Récupérer un produit par ID
  getById: (id: string) =>
    apiClient.get(`/products/${id}`),

  // POST - Créer un produit
  create: (data: CreateProductInput) =>
    apiClient.post('/products', data),

  // PUT - Modifier un produit
  update: (id: string, data: UpdateProductInput) =>
    apiClient.put(`/products/${id}`, data),

  // DELETE - Supprimer un produit
  delete: (id: string) =>
    apiClient.delete(`/products/${id}`),

  // GET - Récupérer les produits d'un vendeur
  getByVendor: (vendorId: string) =>
    apiClient.get(`/products/vendor/${vendorId}`),
}

export default productService
