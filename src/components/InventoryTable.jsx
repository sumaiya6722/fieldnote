import { AlertTriangle, Search } from 'lucide-react'
import { formatBdt } from '../utils/formatters.js'

function getStockStatus(product) {
  if (product.stock === 0) {
    return { label: 'Out of stock', className: 'out-of-stock' }
  }

  if (product.stock <= product.reorderLevel) {
    return { label: 'Low stock', className: 'low-stock' }
  }

  return { label: 'In stock', className: 'in-stock' }
}

function InventoryTable({
  products,
  search,
  stockFilter,
  onSearchChange,
  onStockFilterChange,
  isLoading,
  error,
  onRetry,
}) {
  return (
    <section aria-label="Product inventory" className="inventory-panel">
      <div className="inventory-section-heading">
        <div>
          <h2>Product inventory</h2>
          <p>Search products and filter by current stock level.</p>
        </div>
        {!isLoading && !error && (
          <span className="inventory-result-count">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </span>
        )}
      </div>

      <div className="inventory-toolbar">
        <label className="inventory-search">
          <span className="visually-hidden">Search products</span>
          <Search aria-hidden="true" size={16} />
          <input
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, SKU, or product ID"
            type="search"
            value={search}
          />
        </label>
        <label className="inventory-stock-filter">
          <span>Stock level</span>
          <select
            onChange={(event) => onStockFilterChange(event.target.value)}
            value={stockFilter}
          >
            <option value="all">All stock levels</option>
            <option value="in-stock">In stock</option>
            <option value="low-stock">Low stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
        </label>
      </div>

      {error ? (
        <div className="inventory-inline-state inventory-error" role="alert">
          <AlertTriangle aria-hidden="true" size={18} />
          <span>{error.message}</span>
          <button onClick={onRetry} type="button">Retry</button>
        </div>
      ) : (
        <div
          aria-busy={isLoading}
          aria-label="Scrollable product inventory table"
          className="inventory-table-scroll"
          role="region"
          tabIndex={0}
        >
          <table className="inventory-table">
            <caption className="visually-hidden">Product stock and reorder levels</caption>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">SKU</th>
                <th scope="col">Category</th>
                <th scope="col">Stock</th>
                <th scope="col">Reorder level</th>
                <th className="inventory-price-cell" scope="col">Unit price</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="inventory-table-state" colSpan={7}>
                    Loading inventory…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td className="inventory-table-state" colSpan={7}>
                    No products match this search and stock filter.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stockStatus = getStockStatus(product)

                  return (
                    <tr key={product.id}>
                      <td>
                        <span className="inventory-product-name">{product.name}</span>
                        <span className="inventory-product-id">{product.id}</span>
                      </td>
                      <td>{product.sku}</td>
                      <td>{product.category}</td>
                      <td className="inventory-stock-value">{product.stock}</td>
                      <td>{product.reorderLevel}</td>
                      <td className="inventory-price-cell">{formatBdt(product.price)}</td>
                      <td>
                        <span className={`stock-status stock-status-${stockStatus.className}`}>
                          <span aria-hidden="true" />
                          {stockStatus.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default InventoryTable
