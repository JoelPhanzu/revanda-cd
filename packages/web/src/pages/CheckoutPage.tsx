import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    // TODO: Replace with real order creation + Stripe payment processing before production.
    setTimeout(() => {
      clearCart()
      addNotification({ type: 'success', message: 'Commande passée avec succès.', duration: 3000 })
      navigate('/dashboard')
      setLoading(false)
    }, 600)
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
        <p className="text-5xl">🛒</p>
        <h2 className="mt-4 text-lg font-semibold text-slate-800">Votre panier est vide</h2>
        <p className="mt-1 text-sm text-slate-500">Ajoutez des produits pour passer commande.</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Voir les produits →
        </button>
      </div>
    )
  }

  const STEPS = ['Panier', 'Livraison', 'Paiement']

  return (
    <div className="space-y-6">
      {/* Page header */}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-6 text-white">
        <nav className="mb-2 flex items-center gap-2 text-xs text-indigo-200">
          <Link to="/cart" className="hover:text-white">Panier</Link>
          <span>/</span>
          <span className="text-white font-medium">Checkout</span>
        </nav>
        <h1 className="text-3xl font-black">Finaliser la commande</h1>
        <p className="mt-1 text-sm text-indigo-100">
          {items.length} article{items.length > 1 ? 's' : ''} · Total {formatPrice(total)}
        </p>
      </section>

      {/* Step indicator */}
      <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
              index === 1
                ? 'bg-indigo-600 text-white'
                : index < 1
                ? 'bg-slate-100 text-slate-400 line-through'
                : 'text-slate-400'
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${index === 1 ? 'bg-white text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
              {index + 1}
            </span>
            {step}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Shipping section */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
                Adresse de livraison
              </h2>
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-2">
              {[
                { key: 'fullName', label: 'Nom complet', placeholder: 'Jean Dupont' },
                { key: 'city', label: 'Ville', placeholder: 'Paris' },
                { key: 'address', label: 'Adresse complète', placeholder: '12 rue de la Paix', className: 'sm:col-span-2' },
                { key: 'country', label: 'Pays', placeholder: 'France', className: 'sm:col-span-2' },
              ].map((field) => (
                <div key={field.key} className={field.className}>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{field.label}</label>
                  <input
                    value={form[field.key as keyof ShippingForm]}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Payment section */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">2</span>
                Paiement
              </h2>
            </div>
            <div className="p-6">
              {/* TODO: Replace with real Stripe payment processing before production */}
              {stripeReady ? (
                <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  ✓ Stripe est prêt pour traiter votre paiement.
                </p>
              ) : (
                <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  ⚠ Mode démonstration — la clé Stripe sera configurée en production.
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nom sur la carte</label>
                  <input
                    placeholder="Jean Dupont"
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Numéro de carte</label>
                  <input
                    placeholder="**** **** **** ****"
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
              {/* Security badges */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span>🔒 SSL 256-bit</span>
                <span>💳 Visa · Mastercard · Amex</span>
                <span>🛡 Paiement sécurisé</span>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                Validation en cours...
              </span>
            ) : (
              '✓ Passer la commande'
            )}
          </button>
        </form>

        {/* Order summary */}
        <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-5 py-4">
            <h2 className="text-base font-bold text-white">Récapitulatif</h2>
          </div>
          <div className="bg-white p-5">
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.lineId || item.id} className="flex items-start gap-3 py-3">
                  <img src={item.image} alt={item.name} className="h-12 w-12 flex-shrink-0 rounded-lg object-cover bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      Qté : {item.quantity}
                      {item.selectedColor ? ` · ${item.selectedColor}` : ''}
                      {item.selectedSize ? ` · ${item.selectedSize}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-2 border-t border-slate-200 pt-3 text-sm text-slate-600">
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
              <div className="flex items-center justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total</span>
                <span className="text-indigo-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage
