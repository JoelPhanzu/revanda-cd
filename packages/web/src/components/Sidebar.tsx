import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useUIStore } from '@/store'

export function Sidebar() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  const menuItems = [
    { label: 'Accueil', path: '/', icon: '🏠' },
    { label: 'Produits', path: '/products', icon: '🛍️' },
    ...(isAuthenticated ? [
      { label: 'Tableau de bord', path: '/dashboard', icon: '📊' },
      { label: 'Mon profil', path: '/profile', icon: '👤' },
      { label: 'Mes commandes', path: '/orders', icon: '📦' },
    ] : []),
    ...(user?.displayRole === 'vendor' ? [
      { label: 'Mes produits', path: '/vendor/products', icon: '🏪' },
      { label: 'Ventes', path: '/vendor/sales', icon: '💰' },
    ] : []),
    ...(user?.displayRole === 'admin' ? [
      { label: 'Gestion Admin', path: '/admin', icon: '⚙️' },
      { label: 'Utilisateurs', path: '/admin/users', icon: '👥' },
      { label: 'Produits', path: '/admin/products', icon: '📦' },
    ] : []),
  ]

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        <button 
          className="sidebar-close" 
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.path)
                setSidebarOpen(false)
              }}
              className="sidebar-item"
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <p className="sidebar-version">© 2026 Revanda</p>
      </div>
    </aside>
  )
}

export default Sidebar
