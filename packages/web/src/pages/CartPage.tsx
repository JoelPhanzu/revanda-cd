import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/formatters'
import { SHIPPING_FEE, TAX_RATE } from '@/constants/checkout'
const getLineId = (item: {
  lineId?: string
  id: string
  selectedColor?: string
  selectedSize?: string
}) => item.lineId || `${item.id}::${item.selectedColor || ''}::${item.selectedSize || ''}`

export function CartPage() {
  const navigate = useNavigate()
  const { items, subtotal, updateQuantity, removeItem } = useCartStore()

  const taxes = subtotal * TAX_RATE
  const shipping = items.length > 0 ? SHIPPING_FEE : 0
  const total = subtotal + taxes + shipping

  return (
    <div className="space-y-6">
      {/* Page header */}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-6 text-white">
        <nav className="mb-2 flex items-center gap-2 text-xs text-indigo-200">
          <Link to="/" className="hover:text-white">Accueil</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white">Produits</Link>
          <span>/</span>
          <span className="text-white">Panier</span>
        </nav>
        <h1 className="text-3xl font-black">Mon Panier</h1>
        <p className="mt-1 text-sm text-indigo-100">
          {items.length === 0
            ? 'Votre panier est vide.'
            : `${items.reduce((acc, item) => acc + item.quantity, 0)} article(s) · ${formatPrice(subtotal)} sous-total`}
        </p>
      </section>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
          <p className="text-5xl">🛒</p>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">Votre panier est vide</h2>
          <p className="mt-1 text-sm text-slate-500">Ajoutez des produits pour commencer votre commande.</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Continuer vos achats →
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          {/* Items list */}
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Articles</h2>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                {items.length} article{items.length > 1 ? 's' : ''}
              </span>
            </div>
            {items.map((item) => (
              <article
                key={getLineId(item)}
                className="grid gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-indigo-200 hover:shadow-sm sm:grid-cols-[80px,1fr]"
              >
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover bg-slate-100" />
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                      <p className="text-sm font-bold text-indigo-600">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      onClick={() => removeItem(getLineId(item))}
                    >
                      Supprimer
                    </button>
                  </div>
                  {(item.selectedColor || item.selectedSize) && (
                    <div className="flex flex-wrap gap-1">
                      {item.selectedColor && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          🎨 {item.selectedColor}
                        </span>
                      )}
                      {item.selectedSize && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          📐 {item.selectedSize}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-300">
                      <button
                        type="button"
                        className="h-8 w-8 text-slate-500 transition hover:bg-slate-100"
                        onClick={() => updateQuantity(getLineId(item), item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="w-10 border-x border-slate-300 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="h-8 w-8 text-slate-500 transition hover:bg-slate-100"
                        onClick={() => updateQuantity(getLineId(item), item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      = {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Order summary */}
          <aside className="h-fit space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              {/* Gradient header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-5 py-4">
                <h2 className="text-base font-bold text-white">Résumé de la commande</h2>
              </div>
              <div className="bg-white p-5">
                <dl className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <dt>Sous-total</dt>
                    <dd className="font-medium text-slate-900">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Taxes (8%)</dt>
                    <dd>{formatPrice(taxes)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Frais de port</dt>
                    <dd>{formatPrice(shipping)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-indigo-600">{formatPrice(total)}</span>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="mt-5 h-11 w-full rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Passer à la commande →
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="mt-2 w-full rounded-lg border border-slate-300 py-2 text-sm text-slate-600 transition hover:border-slate-400"
                >
                  Continuer les achats
                </button>
              </div>
            </div>
            {/* Trust badges */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Garanties</p>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p>🔒 Paiement 100% sécurisé</p>
                <p>🚚 Livraison rapide et fiable</p>
                <p>↩ Retour gratuit sous 30 jours</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

export default CartPage
