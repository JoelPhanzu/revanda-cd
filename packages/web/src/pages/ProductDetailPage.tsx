import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
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
  images?: string[]
  colors?: string[]
  sizes?: string[]
  vendor?: {
    companyName?: string
    user?: {
      fullName?: string
    }
  }
  vendorName?: string
}

const normalizeProduct = (product: Product): Product => ({
  ...product,
  image: product.image || '/images/placeholder-product.svg',
  category: product.category || (product as any).categoryId || 'General',
  vendorName: product.vendorName || product.vendor?.companyName || product.vendor?.user?.fullName,
})

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
  images: [
    '/images/placeholder-product.svg',
    '/images/placeholder-product.svg',
    '/images/placeholder-product.svg',
  ],
  colors: ['Noir', 'Blanc'],
  sizes: ['S', 'M', 'L'],
  vendorName: 'Revanda Industrial Supply',
}

export function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectionError, setSelectionError] = useState('')
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

        const selected = normalizeProduct(
          (productResponse.data?.data || productResponse.data || fallbackProduct) as Product
        )
        const allProducts = ((productsResponse.data?.data || productsResponse.data || []) as Product[]).map(
          normalizeProduct
        )
        setProduct(selected)
        setRelated(allProducts.filter((item) => item.id !== selected.id).slice(0, 4))
        setSelectedColor(selected.colors?.[0] || '')
        setSelectedSize(selected.sizes?.[0] || '')
        setQuantity(1)
      } catch {
        setProduct({ ...fallbackProduct, id: id || fallbackProduct.id })
        setRelated([
          fallbackProduct,
          { ...fallbackProduct, id: 'related-1', name: 'Hydraulic Kit', price: 320 },
          { ...fallbackProduct, id: 'related-2', name: 'Power Drill Z4', price: 499 },
        ])
        setSelectedColor(fallbackProduct.colors?.[0] || '')
        setSelectedSize(fallbackProduct.sizes?.[0] || '')
        setQuantity(1)
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

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image, product.image, product.image].filter(Boolean)
  const availableColors = product.colors || []
  const availableSizes = product.sizes || []
  const vendorLabel =
    product.vendor?.companyName || product.vendorName || product.vendor?.user?.fullName || product.vendorId

  const handleAddToCart = () => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectionError('Veuillez sélectionner une couleur.')
      return
    }
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectionError('Veuillez sélectionner une taille.')
      return
    }
    setSelectionError('')
    addItem({
      id: product.id,
      name: product.name,
      image: product.image || productImages[0] || '/images/placeholder-product.svg',
      price: product.price,
      stock: product.stock,
      quantity,
      selectedColor,
      selectedSize,
    })
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="overflow-hidden rounded-xl"
          >
            {productImages.map((image, index) => (
              <SwiperSlide key={`${image}-${index}`}>
                <img src={image} alt={`${product.name} ${index + 1}`} className="aspect-square w-full object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>
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
            <li>Vendor: {vendorLabel}</li>
            <li>Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</li>
          </ul>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Couleur</label>
              <select
                value={selectedColor}
                onChange={(event) => setSelectedColor(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                disabled={availableColors.length === 0}
              >
                {availableColors.length === 0 ? (
                  <option value="">Non disponible</option>
                ) : (
                  availableColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Taille</label>
              <select
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                disabled={availableSizes.length === 0}
              >
                {availableSizes.length === 0 ? (
                  <option value="">Non disponible</option>
                ) : (
                  availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Quantité</label>
              {product.stock > 0 ? (
                <select
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                >
                  {Array.from({ length: product.stock }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  Indisponible
                </p>
              )}
            </div>
          </div>
          {selectionError ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{selectionError}</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAddToCart} disabled={product.stock <= 0}>
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
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-3xl font-bold text-slate-900">{product.rating?.toFixed(1) || '4.7'}</p>
            <p className="text-sm text-slate-600">{'★'.repeat(5)}</p>
            <p className="mt-1 text-xs text-slate-500">{product.reviewsCount || 0} avis clients</p>
          </div>
          <div className="space-y-2 rounded-xl border border-slate-100 p-4 md:col-span-2">
            {[5, 4, 3].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <span className="w-12 text-sm text-slate-600">{star}★</span>
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${star === 5 ? 72 : star === 4 ? 20 : 8}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
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
