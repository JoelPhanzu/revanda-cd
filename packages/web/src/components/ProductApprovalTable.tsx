export interface PendingProduct {
  id: string
  name: string
  description: string
  price: number | string
  validationStatus: string
  vendor: {
    id: string
    companyName: string
    user?: {
      email: string
      fullName: string
    }
  }
}

interface ProductApprovalTableProps {
  products: PendingProduct[]
  onApprove: (productId: string) => Promise<void>
  onReject: (productId: string, reason: string) => Promise<void>
}

export function ProductApprovalTable({ products, onApprove, onReject }: ProductApprovalTableProps) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Vendeur</th>
            <th>Prix</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <strong>{product.name}</strong>
                <div>{product.description}</div>
              </td>
              <td>
                <div>{product.vendor.companyName}</div>
                <small>{product.vendor.user?.email}</small>
              </td>
              <td>{Number(product.price).toFixed(2)} USD</td>
              <td>
                <button onClick={() => void onApprove(product.id)}>Approuver</button>
                <button
                  onClick={() => {
                    const reason = window.prompt('Raison du rejet (optionnel):', '') ?? ''
                    void onReject(product.id, reason)
                  }}
                >
                  Rejeter
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductApprovalTable
