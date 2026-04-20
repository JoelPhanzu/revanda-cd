import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useUIStore } from '@/store'

export function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { toggleSidebar } = useUIStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-left">
        <button onClick={toggleSidebar} className="menu-btn">
          ☰
        </button>
        <div className="logo" onClick={() => navigate('/')}>
          <h2>Revanda</h2>
        </div>
      </div>

      <nav className="header-nav">
        {!isAuthenticated ? (
          <>
            <button onClick={() => navigate('/products')} className="nav-link">
              Produits
            </button>
            <button onClick={() => navigate('/login')} className="nav-link btn-primary">
              Se connecter
            </button>
            <button onClick={() => navigate('/register')} className="nav-link btn-secondary">
              S'inscrire
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/products')} className="nav-link">
              Produits
            </button>
            <button onClick={() => navigate('/dashboard')} className="nav-link">
              Tableau de bord
            </button>
            <div className="user-menu">
              <img src={user?.avatar || '/avatar-default.png'} alt="Avatar" className="avatar" />
              <span className="user-name">{user?.name}</span>
              <div className="dropdown-menu">
                <button onClick={() => navigate('/profile')} className="dropdown-item">
                  Mon profil
                </button>
                <button onClick={() => navigate('/settings')} className="dropdown-item">
                  Paramètres
                </button>
                <hr />
                <button onClick={handleLogout} className="dropdown-item logout">
                  Se déconnecter
                </button>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header