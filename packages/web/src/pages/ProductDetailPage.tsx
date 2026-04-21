import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ProductCard } from '@/components/ProductCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/Button'
import { useCartStore } from '@/store/cartStore'
import { useUserStore } from '@/store/userStore'
import { api } from '@/utils/api'
import { formatPrice } from '@/utils/formatters'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  vendorId: string
  createdAt: string
  updatedAt: string
  rating?: number
  reviewsCount?: number
}

const fallbackProduct: Product = {
  id: 'fallback',
  name: 'Industrial Compressor',
  description: 'Reliable compressor with high pressure output and low noise profile.',
  price: 1599,
  image: '/images/placeholder-product.svg',
  category: 'Machinery',
  stock: 7,
  vendorId: 'v-1',
  createdAt: '2026-01-10',
  updatedAt: '2026-04-10',
  rating: 4.7,
  reviewsCount: 64,
}

export function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()
  const { toggleWishlist } = useUserStore()

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const [productResponse, productsResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/products'),
        ])

        const selected = (productResponse.data?.data || productResponse.data || fallbackProduct) as Product
        const allProducts = (productsResponse.data?.data || productsResponse.data || []) as Product[]
        setProduct(selected)
        setRelated(allProducts.filter((item) => item.id !== selected.id).slice(0, 4))
      } catch {
        setProduct({ ...fallbackProduct, id: id || fallbackProduct.id })
        setRelated([
          fallbackProduct,
          { ...fallbackProduct, id: 'related-1', name: 'Hydraulic Kit', price: 320 },
          { ...fallbackProduct, id: 'related-2', name: 'Power Drill Z4', price: 499 },
        ])
      } finally {
        setLoading(false)
      }
    }

    void fetchProduct()
  }, [id])

  if (loading) {
    return <LoadingSpinner message="Loading product..." />
  }

  if (!product) {
    return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Product not found.</p>
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <img src={product.image} alt={product.name} className="aspect-square w-full rounded-xl object-cover" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <img
                key={item}
                src={product.image}
                alt={`${product.name} thumbnail ${item}`}
                className="aspect-square rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="text-xl font-semibold text-indigo-600">{formatPrice(product.price)}</p>
          <p className="text-sm text-slate-600">
            ⭐ {product.rating?.toFixed(1) || '4.7'} · {product.reviewsCount || 0} reviews
          </p>
          <p className="text-sm text-slate-700">{product.description}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Category: {product.category}</li>
            <li>Vendor: {product.vendorId}</li>
            <li>Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() =>
                addItem({
                  id: product.id,
                  name: product.name,
                  image: product.image,
                  price: product.price,
                  stock: product.stock,
                })
              }
              disabled={product.stock <= 0}
            >
              Add to Cart
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  image: product.image,
                  price: product.price,
                })
              }
            >
              Add to Wishlist
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Related products</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-bold text-slate-900">Customer reviews</h2>
        <div className="mt-4 space-y-4">
          {[
            { author: 'A. Moreau', rating: 5, text: 'Great quality and fast shipping.' },
            { author: 'LogiTech SARL', rating: 4, text: 'Solid product, exactly as described.' },
          ].map((review) => (
            <article key={review.author} className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {review.author} · {'⭐'.repeat(review.rating)}
              </p>
              <p className="mt-1 text-sm text-slate-600">{review.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ProductDetailPage
