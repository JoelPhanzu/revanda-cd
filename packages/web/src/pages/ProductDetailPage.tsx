import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
  const navigate = useNavigate()
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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-indigo-600">Accueil</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-indigo-600">Produits</Link>
        <span>/</span>
        <span className="font-medium text-slate-700 line-clamp-1">{product.name}</span>
      </nav>

      <section className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="overflow-hidden rounded-2xl"
          >
            {productImages.map((image, index) => (
              <SwiperSlide key={`${image}-${index}`}>
                <img src={image} alt={`${product.name} ${index + 1}`} className="aspect-square w-full object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Info */}
        <div className="space-y-5">
          {/* Category + stock chips */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              {product.category}
            </span>
            {product.stock > 0 ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                ✓ En stock ({product.stock})
              </span>
            ) : (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                Rupture de stock
              </span>
            )}
            {vendorLabel && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                🏪 {vendorLabel}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black text-slate-900">{product.name}</h1>

          {/* Price + rating row */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-1.5 text-2xl font-black text-white">
              {formatPrice(product.price)}
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-600">
              ⭐ <strong>{product.rating?.toFixed(1) || '4.7'}</strong>
              <span className="text-slate-400">({product.reviewsCount || 0} avis)</span>
            </span>
          </div>

          <p className="text-sm leading-relaxed text-slate-700">{product.description}</p>

          {/* Options */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Couleur</label>
              <select
                value={selectedColor}
                onChange={(event) => setSelectedColor(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                disabled={availableColors.length === 0}
              >
                {availableColors.length === 0 ? (
                  <option value="">–</option>
                ) : (
                  availableColors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Taille</label>
              <select
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                disabled={availableSizes.length === 0}
              >
                {availableSizes.length === 0 ? (
                  <option value="">–</option>
                ) : (
                  availableSizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Quantité</label>
              {product.stock > 0 ? (
                <select
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {Array.from({ length: product.stock }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              ) : (
                <p className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                  Indisponible
                </p>
              )}
            </div>
          </div>

          {selectionError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{selectionError}</p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              🛒 Ajouter au panier
            </button>
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
              ♡ Wishlist
            </Button>
            <Button variant="secondary" onClick={() => navigate('/cart')}>
              Voir le panier
            </Button>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
            <span>🔒 Paiement sécurisé</span>
            <span>🚚 Livraison rapide</span>
            <span>↩ Retour 30 jours</span>
          </div>
        </div>
      </section>

      {/* Related products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Produits similaires</h2>
          <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Voir tout →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Avis clients</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 p-5 text-center">
            <p className="text-5xl font-black text-indigo-600">{product.rating?.toFixed(1) || '4.7'}</p>
            <p className="mt-1 text-lg text-amber-400">{'★'.repeat(5)}</p>
            <p className="mt-1 text-xs text-slate-500">{product.reviewsCount || 0} avis clients</p>
          </div>
          <div className="space-y-3 rounded-xl border border-slate-100 p-5 md:col-span-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const widths: Record<number, string> = { 5: '72%', 4: '20%', 3: '5%', 2: '2%', 1: '1%' }
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 text-right text-sm text-amber-400">{'★'.repeat(star)}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: widths[star] }} />
                  </div>
                  <span className="w-8 text-right text-xs text-slate-400">{widths[star]}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {[
            { author: 'A. Moreau', rating: 5, text: 'Excellent produit, livraison rapide et emballage soigné.' },
            { author: 'LogiTech SARL', rating: 4, text: 'Conforme à la description. Rapport qualité-prix très bon.' },
          ].map((review) => (
            <article key={review.author} className="rounded-xl border border-slate-100 p-4 transition hover:border-indigo-200 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{review.author}</p>
                <span className="text-sm text-amber-400">{'★'.repeat(review.rating)}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{review.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ProductDetailPage
