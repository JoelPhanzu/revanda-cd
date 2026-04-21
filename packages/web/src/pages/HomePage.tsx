import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { ProductCard } from '@/components/ProductCard'
import { useCartStore } from '@/store/cartStore'

const featuredProducts = [
  {
    id: '1',
    name: 'Industrial Drill X2',
    description: 'High-performance drilling machine for heavy work.',
    price: 899,
    image: '/images/placeholder-product.svg',
    category: 'Machinery',
    stock: 10,
    vendorId: 'v-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rating: 4.8,
    reviewsCount: 129,
  },
  {
    id: '2',
    name: 'Steel Safety Helmet',
    description: 'Durable safety helmet with ergonomic comfort.',
    price: 42,
    image: '/images/placeholder-product.svg',
    category: 'Safety',
    stock: 50,
    vendorId: 'v-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rating: 4.5,
    reviewsCount: 83,
  },
  {
    id: '3',
    name: 'Warehouse Barcode Scanner',
    description: 'Fast scanner optimized for logistics workflows.',
    price: 249,
    image: '/images/placeholder-product.svg',
    category: 'Electronics',
    stock: 32,
    vendorId: 'v-3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rating: 4.7,
    reviewsCount: 47,
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()

  return (
    <div className="space-y-16 pb-8">
      <section className="grid gap-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-white md:grid-cols-2 md:p-14">
        <div className="space-y-5">
          <p className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide">
            B2B Marketplace
          </p>
          <h1 className="text-3xl font-black leading-tight md:text-5xl">
            Buy and resell equipment with confidence.
          </h1>
          <p className="text-indigo-100">
            Revanda helps teams discover trusted products, compare offers, and checkout faster.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(isAuthenticated ? '/products' : '/register')}
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              {isAuthenticated ? 'Shop now' : 'Create account'}
            </button>
            <button
              onClick={() => navigate('/products')}
              className="rounded-lg border border-white/60 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              Explore products
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {['10K+ Products', '2K Vendors', '99.9% Secure', '24/7 Support'].map((item) => (
            <div key={item} className="rounded-xl bg-white/15 p-4 text-center backdrop-blur-sm">
              <p className="text-xl font-bold">{item.split(' ')[0]}</p>
              <p className="mt-1 text-sm text-indigo-100">{item.split(' ').slice(1).join(' ')}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured products</h2>
          <button className="text-sm font-semibold text-indigo-600" onClick={() => navigate('/products')}>
            View all
          </button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
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
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Shop by category</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {['Machinery', 'Safety', 'Electronics', 'Tools'].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => navigate(`/products?category=${encodeURIComponent(category)}`)}
              className="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-indigo-300 hover:shadow-md"
            >
              <p className="text-sm text-slate-500">Category</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{category}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Orders delivered', value: '152K+' },
          { label: 'Verified sellers', value: '2,400+' },
          { label: 'On-time shipping', value: '98.2%' },
          { label: 'Customer rating', value: '4.8/5' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-100 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-slate-900 p-8 text-white">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Stay in the loop</h2>
            <p className="mt-2 text-sm text-slate-300">
              Get weekly product picks, category trends, and procurement insights.
            </p>
          </div>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="email"
              placeholder="you@company.com"
              className="h-11 flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              aria-label="Newsletter email"
            />
            <button
              type="submit"
              className="h-11 rounded-lg bg-indigo-500 px-5 text-sm font-semibold transition hover:bg-indigo-400"
            >
              Subscribe
            </button>
          </form>
          {!isAuthenticated ? (
            <div className="md:col-span-2">
              <button
                onClick={() => navigate('/register')}
                className="rounded-lg border border-indigo-400 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-500/20"
              >
                Start free account
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default HomePage
