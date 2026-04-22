import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '@/components/ProductCard'
import { Input } from '@/components/Input'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useCartStore } from '@/store/cartStore'
import { api } from '@/utils/api'

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
  vendorName?: string
  vendor?: {
    companyName?: string
    user?: {
      fullName?: string
    }
  }
}

const PRODUCTS_PER_PAGE = 40

const normalizeProduct = (product: Product): Product => ({
  ...product,
  image: product.image || '/images/placeholder-product.svg',
  category: product.category || (product as any).categoryId || 'General',
  vendorName: product.vendorName || product.vendor?.companyName || product.vendor?.user?.fullName,
})

const fallbackProducts: Product[] = [
  {
    id: 'p-1',
    name: 'Hydraulic Press',
    description: 'Heavy-duty press for workshop production.',
    price: 1200,
    image: '/images/placeholder-product.svg',
    category: 'Machinery',
    stock: 8,
    vendorId: 'v-1',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    rating: 4.9,
    reviewsCount: 88,
  },
  {
    id: 'p-2',
    name: 'Protective Gloves',
    description: 'Cut-resistant gloves for industrial safety.',
    price: 16,
    image: '/images/placeholder-product.svg',
    category: 'Safety',
    stock: 120,
    vendorId: 'v-2',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    rating: 4.5,
    reviewsCount: 143,
  },
  {
    id: 'p-3',
    name: 'Forklift Battery',
    description: 'Long-lasting battery for warehouse forklift fleets.',
    price: 680,
    image: '/images/placeholder-product.svg',
    category: 'Electronics',
    stock: 14,
    vendorId: 'v-3',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    rating: 4.6,
    reviewsCount: 33,
  },
]

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [vendor, setVendor] = useState(searchParams.get('vendor') || 'all')
  const [priceRange, setPriceRange] = useState('all')
  const [rating, setRating] = useState('all')
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'rating'>('price')
  const [page, setPage] = useState(1)
  const { addItem } = useCartStore()

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const response = await api.get('/products')
        const productList = Array.isArray(response.data) ? response.data : response.data?.data || []
        setProducts((productList as Product[]).map(normalizeProduct))
      } catch {
        setProducts(fallbackProducts)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProducts()
  }, [])

  useEffect(() => {
    const next = new URLSearchParams()
    if (searchTerm) {
      next.set('search', searchTerm)
    }
    if (category !== 'all') {
      next.set('category', category)
    }
    if (vendor !== 'all') {
      next.set('vendor', vendor)
    }
    setSearchParams(next, { replace: true })
  }, [category, searchTerm, setSearchParams, vendor])

  const filteredProducts = useMemo(() => {
    const [minPrice, maxPrice] =
      priceRange === 'all' ? [0, Number.POSITIVE_INFINITY] : priceRange.split('-').map(Number)

    const list = products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = category === 'all' || product.category === category
      const matchesVendor = vendor === 'all' || product.vendorId === vendor
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice
      const matchesRating = rating === 'all' || (product.rating || 0) >= Number(rating)
      return matchesSearch && matchesCategory && matchesVendor && matchesPrice && matchesRating
    })

    return [...list].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0)
      }
      return a.price - b.price
    })
  }, [category, priceRange, products, rating, searchTerm, sortBy, vendor])

  const paginatedProducts = filteredProducts.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))

  return (
    <div className="space-y-6">
      {/* Page header — gradient strip like homepage */}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-7 text-white">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold tracking-wide">
              Catalogue
            </p>
            <h1 className="text-3xl font-black">Produits</h1>
            <p className="mt-1 text-sm text-indigo-100">
              {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''} · filtrez, triez et commandez rapidement.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCategory('all')
              setVendor('all')
              setPriceRange('all')
              setRating('all')
              setSearchTerm('')
              setPage(1)
            }}
            className="rounded-lg border border-white/40 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </section>

      {isLoading ? (
        <LoadingSpinner message="Chargement des produits..." />
      ) : (
        <>
          {/* Filter bar */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Filtres</p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <div className="lg:col-span-2">
                <Input
                  label="Recherche"
                  placeholder="Nom, description..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setPage(1)
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Catégorie</label>
                <select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value)
                    setPage(1)
                  }}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Toutes</option>
                  {[...new Set(products.map((product) => product.category))].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Prix</label>
                <select
                  value={priceRange}
                  onChange={(event) => setPriceRange(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Tous</option>
                  <option value="0-50">$0 – $50</option>
                  <option value="50-250">$50 – $250</option>
                  <option value="250-1000">$250 – $1 000</option>
                  <option value="1000-5000">$1 000 – $5 000</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Vendeur</label>
                <select
                  value={vendor}
                  onChange={(event) => {
                    setVendor(event.target.value)
                    setPage(1)
                  }}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Tous</option>
                  {[...new Set(products.map((product) => product.vendorId))]
                    .filter(Boolean)
                    .map((item) => (
                      <option key={item} value={item}>
                        {products.find((product) => product.vendorId === item)?.vendorName || item}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Note min.</label>
                <select
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Toutes</option>
                  <option value="4">4★ et +</option>
                  <option value="4.5">4.5★ et +</option>
                </select>
              </div>
            </div>
            {/* Sort strip */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Trier par :</span>
              {(['price', 'name', 'rating'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSortBy(option)}
                  className={`rounded-full px-3 py-1 font-medium transition ${sortBy === option ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  {option === 'price' ? 'Prix' : option === 'name' ? 'Nom' : 'Note'}
                </button>
              ))}
            </div>
          </section>

          {paginatedProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 text-base font-semibold text-slate-700">Aucun produit trouvé</p>
              <p className="mt-1 text-sm text-slate-500">Essayez d'ajuster vos filtres ou votre recherche.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() =>
                    addItem({
                      id: product.id,
                      name: product.name,
                      image: product.image,
                      price: product.price,
                      stock: product.stock,
                    })
                  }
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
              className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40"
            >
              ← Précédent
            </button>
            <span className="rounded-lg bg-indigo-600 px-3 py-1 text-sm font-semibold text-white">
              {page}
            </span>
            <span className="text-sm text-slate-500">/ {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page >= totalPages}
              className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ProductsPage
