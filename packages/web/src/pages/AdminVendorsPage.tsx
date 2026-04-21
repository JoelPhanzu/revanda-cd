import { useEffect, useState } from 'react'
import { apiClient } from '@/services/api'

interface VendorListItem {
  id: string
  companyName: string
  user: {
    fullName: string
    email: string
  }
  _count: {
    products: number
  }
}

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Erreur lors du chargement des vendeurs'
}

export function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = (await apiClient.get('/admin/vendors')) as VendorListItem[]
        setVendors(data)
      } catch (fetchError) {
        setError(getErrorMessage(fetchError))
      } finally {
        setIsLoading(false)
      }
    }

    void fetchVendors()
  }, [])

  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="dashboard-page">
      <h1>Gestion des vendeurs</h1>
      <table>
        <thead>
          <tr>
            <th>Entreprise</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Produits</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id}>
              <td>{vendor.companyName}</td>
              <td>{vendor.user.fullName}</td>
              <td>{vendor.user.email}</td>
              <td>{vendor._count.products}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminVendorsPage
