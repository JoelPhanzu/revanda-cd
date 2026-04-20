import { useEffect, useState } from 'react'
import { useProductStore } from '@/store'
import { useUIStore } from '@/store'
import { productService } from '@/services/products'

export function ProductsPage() {
  const { products, setProducts, filters, setFilters, isLoading, setIsLoading } = useProductStore()
  const { addNotification } = useUIStore()
  const [searchTerm, setSearchTerm] = useState('')

  // Charger les produits
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const response = (await productService.getAll(filters)) as any
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
  }, [filters])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setFilters({ search: value })
  }

  const handleCategoryFilter = (category: string) => {
    setFilters({ category: category === 'all' ? undefined : category })
  }

  return (
    <div className="products-page">
      <h1>Produits</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={handleSearch}
        />

        <select onChange={(e) => handleCategoryFilter(e.target.value)}>
          <option value="all">Toutes les catégories</option>
          <option value="electronics">Électronique</option>
          <option value="clothing">Vêtements</option>
          <option value="books">Livres</option>
        </select>
      </div>

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
              <p className="stock">Stock: {product.stock}</p>
              <button>Ajouter au panier</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductsPage