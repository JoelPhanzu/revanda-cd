import { useEffect, useState } from 'react'
import { apiClient } from '@/services/api'
import { VendorProductsTable } from '@/components/VendorProductsTable'

interface VendorProduct {
  id: string
  name: string
  price: number | string
  validationStatus: string
}

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Erreur lors du chargement des produits'
}

export function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = (await apiClient.get('/products/my-products')) as VendorProduct[]
        setProducts(data)
      } catch (fetchError) {
        setError(getErrorMessage(fetchError))
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProducts()
  }, [])

  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="dashboard-page">
      <h1>Mes produits</h1>
      {products.length === 0 ? <p>Aucun produit trouvé.</p> : <VendorProductsTable products={products} />}
    </div>
  )
}

export default VendorProductsPage
