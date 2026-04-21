import { useEffect, useState } from 'react'
import { apiClient } from '@/services/api'
import { PendingProduct, ProductApprovalTable } from '@/components/ProductApprovalTable'

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Erreur lors du chargement des produits en attente'
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<PendingProduct[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = (await apiClient.get('/admin/products/pending')) as PendingProduct[]
        setProducts(data)
      } catch (fetchError) {
        setError(getErrorMessage(fetchError))
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProducts()
  }, [])

  const handleApprove = async (productId: string) => {
    await apiClient.put(`/products/${productId}/approve`)
    setProducts((current) => current.filter((product) => product.id !== productId))
  }

  const handleReject = async (productId: string, reason: string) => {
    await apiClient.put(`/products/${productId}/reject`, { reason })
    setProducts((current) => current.filter((product) => product.id !== productId))
  }

  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="dashboard-page">
      <h1>Validation des produits ({products.length})</h1>
      {products.length === 0 ? (
        <p>Aucun produit en attente de validation.</p>
      ) : (
        <ProductApprovalTable products={products} onApprove={handleApprove} onReject={handleReject} />
      )}
    </div>
  )
}

export default AdminProductsPage
