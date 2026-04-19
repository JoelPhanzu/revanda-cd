import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'

export function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenue sur Revanda</h1>
          <p>La plateforme e-commerce complète pour vendre et acheter en ligne</p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <button onClick={() => navigate('/dashboard')} className="btn-primary">
                  Aller au tableau de bord
                </button>
                <button onClick={() => navigate('/products')} className="btn-secondary">
                  Voir les produits
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="btn-primary">
                  Se connecter
                </button>
                <button onClick={() => navigate('/register')} className="btn-secondary">
                  S'inscrire
                </button>
              </>
            )}
          </div>
        </div>

        <div className="hero-image">
          <img src="/hero.png" alt="Hero" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Nos fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>E-commerce complet</h3>
            <p>Achetez et vendez des produits facilement</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Gestion des utilisateurs</h3>
            <p>Rôles multiples: Client, Vendeur, Admin, Super Admin</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Sécurité</h3>
            <p>Authentification JWT sécurisée</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Tableau de bord</h3>
            <p>Suivez vos ventes et achats en temps réel</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Filtres avancés</h3>
            <p>Trouvez facilement ce que vous cherchez</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>Admin complet</h3>
            <p>Gérez les utilisateurs et les produits</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-item">
          <h3>1000+</h3>
          <p>Produits disponibles</p>
        </div>

        <div className="stat-item">
          <h3>500+</h3>
          <p>Utilisateurs actifs</p>
        </div>

        <div className="stat-item">
          <h3>50+</h3>
          <p>Vendeurs partenaires</p>
        </div>

        <div className="stat-item">
          <h3>24/7</h3>
          <p>Support client</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Prêt à commencer?</h2>
        <p>Rejoignez notre communauté de vendeurs et acheteurs</p>

        {!isAuthenticated && (
          <div className="cta-actions">
            <button onClick={() => navigate('/register')} className="btn-primary btn-large">
              Créer un compte gratuit
            </button>
            <button onClick={() => navigate('/products')} className="btn-secondary btn-large">
              Parcourir les produits
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Revanda</h4>
            <ul>
              <li><a href="/">Accueil</a></li>
              <li><a href="/products">Produits</a></li>
              <li><a href="/about">À propos</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Utilisateur</h4>
            <ul>
              <li><a href="/login">Se connecter</a></li>
              <li><a href="/register">S'inscrire</a></li>
              <li><a href="/profile">Mon profil</a></li>
              <li><a href="/orders">Mes commandes</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/help">Aide</a></li>
              <li><a href="/privacy">Confidentialité</a></li>
              <li><a href="/terms">Conditions</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Revanda. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage