interface VendorProduct {
  id: string
  name: string
  price: number | string
  validationStatus: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | string
}

interface VendorProductsTableProps {
  products: VendorProduct[]
}

const getStatusLabel = (status: VendorProduct['validationStatus']) => {
  switch (status) {
    case 'APPROVED':
      return 'Approuvé'
    case 'PENDING_APPROVAL':
      return 'En attente'
    case 'REJECTED':
      return 'Rejeté'
    default:
      return status
  }
}

export function VendorProductsTable({ products }: VendorProductsTableProps) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Prix</th>
            <th>Validation</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{Number(product.price).toFixed(2)} USD</td>
              <td>{getStatusLabel(product.validationStatus)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VendorProductsTable
