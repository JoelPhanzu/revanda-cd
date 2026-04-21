import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { StripeCheckout } from '@/components/StripeCheckout'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

type CheckoutOrder = {
  id: string
  totalAmount: number
  items?: Array<unknown>
}

type CheckoutOrderResponse = CheckoutOrder & {
  totalAmount: number | string
}

export const CheckoutPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [order, setOrder] = useState<CheckoutOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!orderId) {
      setError('Order not found')
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        const response = await apiClient.get<CheckoutOrderResponse>(`/orders/${orderId}`)
        const data = ((response as { data?: CheckoutOrderResponse }).data ?? response) as CheckoutOrderResponse
        const totalAmount = Number(data.totalAmount)
        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
          throw new Error('Invalid order amount')
        }
        setOrder({ ...data, totalAmount })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load order'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [isAuthenticated, navigate, orderId])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  if (!order) {
    return <div>Order not found</div>
  }

  const handlePaymentSuccess = () => {
    navigate('/dashboard')
  }

  const handlePaymentError = (message: string) => {
    setError(message)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Order ID:</span> {order.id}
            </p>
            <p>
              <span className="font-medium">Items:</span> {order.items?.length || 0}
            </p>
            <p className="text-lg font-bold">
              <span className="font-medium">Total:</span> ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <StripeCheckout orderId={order.id} amount={order.totalAmount} onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
      </div>
    </div>
  )
}
