import { useNavigate } from 'react-router-dom'
import { type Product } from '@/services/products'

export interface ProductCardProps {
  product: Product
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
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        {product.stock === 0 && <div className="out-of-stock">Rupture de stock</div>}
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <div className="product-price">{product.price}€</div>
          <div className="product-actions">
            <button
              onClick={() => navigate(`/products/${product.id}`)}
              className="btn-secondary"
            >
              Détails
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary"
            >
              {product.stock === 0 ? 'Indisponible' : 'Panier'}
            </button>
          </div>
        </div>

        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-stock">Stock: {product.stock}</span>
        </div>
      </div>
    </div>
  )
}

export default ProductCard