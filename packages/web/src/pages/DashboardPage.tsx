import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useProductStore } from '@/store'
import { useUIStore } from '@/store'
import { productService } from '@/services/products'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()
  const { products, setProducts, isLoading, setIsLoading } = useProductStore()
  const { addNotification } = useUIStore()

  // Vérifier l'authentification
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Charger les produits
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const response = (await productService.getAll()) as any
        const productList = Array.isArray(response) ? response : response?.data || []
        setProducts(productList)
      } catch (error: any) {
        addNotification({
          type: 'error',
          message: 'Erreur lors du chargement des produits',
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleLogout = () => {
    logout()
    addNotification({
      type: 'success',
      message: 'Déconnecté avec succès',
      duration: 3000,
    })
    navigate('/login')
  }

  if (!isAuthenticated) {
    return <div>Chargement...</div>
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Tableau de bord</h1>
        <div className="header-actions">
          <span>Bienvenue, {user?.name}!</span>
          <button onClick={handleLogout}>Se déconnecter</button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="user-info">
          <h2>Informations utilisateur</h2>
          <div className="info-card">
            <p><strong>Nom:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Rôle:</strong> {user?.displayRole || user?.role}</p>
          </div>
        </section>

        <section className="products-section">
          <h2>Produits</h2>
          {isLoading ? (
            <p>Chargement des produits...</p>
          ) : products.length === 0 ? (
            <p>Aucun produit trouvé</p>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p className="price">{product.price}€</p>
                  <button onClick={() => navigate(`/products/${product.id}`)}>
                    Voir détails
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
