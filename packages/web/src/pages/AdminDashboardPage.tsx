import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store'
import { apiClient } from '@/services/api'

interface AdminStats {
  totalUsers: number
  totalVendors: number
  totalProducts: number
  pendingProducts: number
  totalOrders: number
  totalRevenue: number
}

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Erreur lors du chargement des statistiques'
}

export function AdminDashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = (await apiClient.get('/admin/dashboard')) as AdminStats
        setStats(data)
      } catch (fetchError) {
        setError(getErrorMessage(fetchError))
      } finally {
        setIsLoading(false)
      }
    }

    void fetchStats()
  }, [])

  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="dashboard-page">
      <h1>Tableau de bord Admin</h1>
      <p>Connecté: {user?.name}</p>
      <ul>
        <li>Total utilisateurs: {stats?.totalUsers ?? 0}</li>
        <li>Total vendeurs: {stats?.totalVendors ?? 0}</li>
        <li>Total produits: {stats?.totalProducts ?? 0}</li>
        <li>Produits en attente: {stats?.pendingProducts ?? 0}</li>
        <li>Total commandes: {stats?.totalOrders ?? 0}</li>
        <li>Revenus: {(stats?.totalRevenue ?? 0).toFixed(2)} USD</li>
      </ul>
    </div>
  )
}

export default AdminDashboardPage
