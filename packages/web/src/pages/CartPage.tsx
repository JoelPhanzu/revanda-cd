import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/formatters'

const TAX_RATE = 0.08
const SHIPPING_FEE = 12
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Panier</h1>
        <p className="mt-1 text-sm text-slate-600">Vérifiez vos articles avant de passer à la commande.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">Votre panier est vide.</p>
          <Button className="mt-4" onClick={() => navigate('/products')}>
            Continuer vos achats
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            {items.map((item) => (
              <article key={getLineId(item)} className="grid gap-3 border-b border-slate-100 pb-4 last:border-none last:pb-0 sm:grid-cols-[90px,1fr]">
                <img src={item.image} alt={item.name} className="h-24 w-24 rounded-lg object-cover" />
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">{item.name}</h2>
                      <p className="text-sm text-slate-600">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                      onClick={() => removeItem(getLineId(item))}
                    >
                      Supprimer
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.selectedColor ? `Couleur: ${item.selectedColor}` : 'Couleur: -'} ·{' '}
                    {item.selectedSize ? `Taille: ${item.selectedSize}` : 'Taille: -'}
                  </p>
                  <div className="inline-flex items-center rounded-lg border border-slate-300">
                    <button
                      type="button"
                      className="h-8 w-8 text-slate-600"
                      onClick={() => updateQuantity(getLineId(item), item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="h-8 w-8 text-slate-600"
                      onClick={() => updateQuantity(getLineId(item), item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Résumé</h2>
            <dl className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt>Sous-total</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Taxes</dt>
                <dd>{formatPrice(taxes)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Frais de port</dt>
                <dd>{formatPrice(shipping)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button className="mt-5 w-full" onClick={() => navigate('/checkout')}>
              Checkout
            </Button>
          </aside>
        </div>
      )}
    </div>
  )
}

export default CartPage
