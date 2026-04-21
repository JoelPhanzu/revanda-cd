import { type FormEvent, useEffect, useState } from 'react'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { type StripeElementsOptions } from '@stripe/stripe-js'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { stripeService } from '@/services/stripe'

interface StripeCheckoutProps {
  orderId: string
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

interface CheckoutFormProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

const CheckoutForm = ({ amount, onSuccess, onError }: CheckoutFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError('Stripe is not ready yet')
      return
    }

    setIsLoading(true)

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      })

      if (result.error) {
        onError(result.error.message || 'Payment failed')
        return
      }

      onSuccess()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed'
      onError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <div className="mt-4">
        <Button type="submit" disabled={isLoading || !stripe || !elements} className="w-full">
          {isLoading ? <LoadingSpinner size="small" /> : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
}

export const StripeCheckout = ({ orderId, amount, onSuccess, onError }: StripeCheckoutProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadingIntent, setLoadingIntent] = useState(true)

  useEffect(() => {
    const createIntent = async () => {
      setLoadingIntent(true)
      try {
        const { clientSecret: secret } = await stripeService.createPaymentIntent(orderId, amount)
        setClientSecret(secret)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to initialize payment'
        onError(message)
      } finally {
        setLoadingIntent(false)
      }
    }

    createIntent()
  }, [amount, onError, orderId])

  if (loadingIntent) {
    return <LoadingSpinner message="Preparing secure payment..." />
  }

  if (!clientSecret) {
    return null
  }

  const options: StripeElementsOptions = {
    clientSecret,
  }

  return (
    <Elements stripe={stripeService.getStripe()} options={options}>
      <div className="max-w-md mx-auto p-6 border rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Secure Payment</h2>
        <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} />
      </div>
    </Elements>
  )
}
