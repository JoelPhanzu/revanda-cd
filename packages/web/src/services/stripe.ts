import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { apiClient } from '@/services/api'

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

export const stripeService = {
  getStripe: async (): Promise<Stripe | null> => {
    return stripePromise
  },

  createPaymentIntent: async (orderId: string) => {
    return apiClient.post('/payments/create-intent', { orderId }) as Promise<{
      clientSecret: string
      paymentIntentId: string
    }>
  },

  getPaymentStatus: async (paymentIntentId: string) => {
    return apiClient.get(`/payments/${paymentIntentId}`)
  },
}
