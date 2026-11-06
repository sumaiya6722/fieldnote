import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'

function LowStockProducts({ products, isLoading, error, onRetry }) {
  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.stock > 0 && product.stock <= product.reorderLevel,
      ),
    [products],
  )

  return (
    <section aria-label="Low-stock products" className="inventory-panel stock-alert-panel">
      <div className="inventory-section-heading">
        <div>
          <h2>Low-stock products</h2>
          <p>Products at or below their reorder level.</p>
        </div>
        {!isLoading && !error && (
          <span className="inventory-alert-count inventory-alert-count-warning">
            {lowStockProducts.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="inventory-alert-state" role="status">Loading stock levels…</p>
      ) : error ? (
        <div className="inventory-alert-state inventory-error" role="alert">
          <span>{error.message}</span>
          <button onClick={onRetry} type="button">Retry</button>
        </div>
      ) : lowStockProducts.length === 0 ? (
        <p className="inventory-alert-state" role="status">
          All in-stock products are above their reorder levels.
        </p>
      ) : (
        <ul className="stock-products-list">
          {lowStockProducts.map((product) => (
            <li key={product.id}>
              <span aria-hidden="true" className="stock-product-icon">
                <AlertTriangle size={15} />
              </span>
              <span className="stock-product-name">
                <strong>{product.name}</strong>
                <small>{product.sku}</small>
              </span>
              <span className="stock-product-quantity">
                <strong>{product.stock}</strong>
                <small>of {product.reorderLevel} min</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default LowStockProducts
