import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/services/api'

interface VendorPayment {
  id: string
  amount: number | string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | string
  createdAt: string
}

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Erreur lors du chargement des ventes'
}

export function VendorSalesPage() {
  const [payments, setPayments] = useState<VendorPayment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = (await apiClient.get('/payments')) as VendorPayment[]
        setPayments(data)
      } catch (fetchError) {
        setError(getErrorMessage(fetchError))
      } finally {
        setIsLoading(false)
      }
    }

    void fetchSales()
  }, [])

  const totalSales = useMemo(
    () => payments.reduce((sum, payment) => sum + Number(payment.amount), 0),
    [payments],
  )

  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="dashboard-page">
      <h1>Ventes vendeur</h1>
      <p>Total ventes: {totalSales.toFixed(2)} USD</p>
      <p>Transactions: {payments.length}</p>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Montant</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
              <td>{Number(payment.amount).toFixed(2)} USD</td>
              <td>{payment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VendorSalesPage
