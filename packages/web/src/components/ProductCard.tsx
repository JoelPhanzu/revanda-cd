import { useNavigate } from 'react-router-dom'
import { type Product } from '@/services/products'
import { Button } from './Button'
import { formatPrice } from '@/utils/formatters'

export interface ProductCardProps {
  product: Product & { rating?: number; reviewsCount?: number }
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const navigate = useNavigate()

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 text-sm font-semibold text-white">
            Out of stock
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
        <p className="text-sm text-slate-600">{product.description}</p>
        <p className="text-lg font-bold text-indigo-600">{formatPrice(product.price)}</p>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1">{product.category}</span>
          <span>
            ⭐ {product.rating?.toFixed(1) || '4.5'} ({product.reviewsCount || 0})
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            Details
          </Button>
          <Button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1">
            {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          {product.stock > 0 ? `${product.stock} units available` : 'No units left'}
        </p>
      </div>
    </article>
  )
}

export default ProductCard
