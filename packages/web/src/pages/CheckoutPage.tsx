import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { stripeService } from '@/services/stripe'
import { formatPrice } from '@/utils/formatters'
import { SHIPPING_FEE, TAX_RATE } from '@/constants/checkout'

type ShippingForm = {
  fullName: string
  address: string
  city: string
  country: string
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { addNotification } = useUIStore()
  const { items, subtotal, clearCart } = useCartStore()
  const [form, setForm] = useState<ShippingForm>({
    fullName: '',
    address: '',
    city: '',
    country: '',
  })
  const [stripeReady, setStripeReady] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkStripe = async () => {
      const stripe = await stripeService.getStripe()
      setStripeReady(Boolean(stripe))
    }
    void checkStripe()
  }, [])

  const { taxes, shipping, total } = useMemo(() => {
    const taxesValue = subtotal * TAX_RATE
    const shippingValue = items.length > 0 ? SHIPPING_FEE : 0
    return {
      taxes: taxesValue,
      shipping: shippingValue,
      total: subtotal + taxesValue + shippingValue,
    }
  }, [items.length, subtotal])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (items.length === 0) {
      addNotification({ type: 'error', message: 'Votre panier est vide.', duration: 2500 })
      return
    }
    if (!form.fullName || !form.address || !form.city || !form.country) {
      addNotification({ type: 'error', message: 'Veuillez compléter l’adresse de livraison.', duration: 3000 })
      return
    }

    setLoading(true)
    setTimeout(() => {
      clearCart()
      addNotification({ type: 'success', message: 'Commande passée avec succès.', duration: 3000 })
      navigate('/dashboard')
      setLoading(false)
    }, 600)
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm text-slate-600">Votre panier est vide. Ajoutez des articles pour continuer.</p>
        <Button className="mt-4" onClick={() => navigate('/products')}>
          Voir les produits
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Adresse de livraison</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { key: 'fullName', label: 'Nom complet' },
                { key: 'city', label: 'Ville' },
                { key: 'address', label: 'Adresse', className: 'sm:col-span-2' },
                { key: 'country', label: 'Pays', className: 'sm:col-span-2' },
              ].map((field) => (
                <div key={field.key} className={field.className}>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{field.label}</label>
                  <input
                    value={form[field.key as keyof ShippingForm]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Paiement</h2>
            <p className="mt-1 text-sm text-slate-600">
              {stripeReady
                ? 'Stripe est prêt pour traiter votre paiement.'
                : 'Clé Stripe non configurée. Le paiement réel sera activé après configuration.'}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Nom sur la carte"
                className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <input
                placeholder="**** **** **** ****"
                className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </section>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Validation...' : 'Passer la commande'}
          </Button>
        </form>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Résumé commande</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.lineId || item.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-slate-500">
                    Qté: {item.quantity}
                    {item.selectedColor ? ` · ${item.selectedColor}` : ''}
                    {item.selectedSize ? ` · ${item.selectedSize}` : ''}
                  </p>
                </div>
                <span className="font-medium text-slate-800">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Taxes</span>
              <span>{formatPrice(taxes)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Livraison</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage
