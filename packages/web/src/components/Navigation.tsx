import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Input } from './Input'
import { Button } from './Button'
import { useAuthStore } from '@/store'
import { useCartStore } from '@/store/cartStore'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Categories', to: '/products' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export function Navigation() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { itemCount } = useCartStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleSearchSubmit = () => {
    navigate(`/products?search=${encodeURIComponent(search)}`)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-black text-indigo-600">
            Revanda
          </Link>
          <div className="hidden flex-1 md:block">
            <Input
              aria-label="Search products"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearchSubmit()
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm md:hidden"
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            aria-label="Cart"
          >
            Cart ({itemCount})
          </button>
          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm text-slate-700">{user?.name}</span>
              <Button variant="secondary" onClick={() => navigate('/profile')}>
                Profile
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button variant="secondary" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/register')}>Sign up</Button>
            </div>
          )}
        </div>
        <nav className={`${mobileMenuOpen ? 'mt-3 block' : 'hidden'} md:mt-3 md:block`}>
          <ul className="flex flex-col gap-2 md:flex-row md:items-center md:gap-5">
            {navItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navigation
