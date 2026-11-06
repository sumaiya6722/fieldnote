import { ArrowDown, ArrowDownUp, ArrowUp } from 'lucide-react'
import { formatBdt } from '../utils/formatters.js'

const dateFormatter = new Intl.DateTimeFormat('en-BD', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Dhaka',
})

const columns = [
  { key: 'id', label: 'Order ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'placedAt', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'total', label: 'Total', className: 'order-amount-heading' },
]

function SortButton({ column, sort, onSort }) {
  const isSorted = sort.sortBy === column.key
  const SortIcon = !isSorted
    ? ArrowDownUp
    : sort.sortDirection === 'asc'
      ? ArrowUp
      : ArrowDown

  return (
    <button
      aria-label={`Sort by ${column.label}`}
      className="order-sort-button"
      onClick={() => onSort(column.key)}
      type="button"
    >
      {column.label}
      <SortIcon aria-hidden="true" size={13} />
    </button>
  )
}

function OrdersDataTable({
  orders,
  isLoading,
  sort,
  onSort,
  selectedOrderId,
  onSelectOrder,
}) {
  return (
    <div className="orders-table-card">
      <div
        aria-label="Scrollable orders table"
        className="orders-table-scroll"
        role="region"
        tabIndex={0}
      >
        <table className="orders-data-table">
          <caption className="visually-hidden">
            Orders. Select an order ID to view its details.
          </caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  aria-sort={
                    sort.sortBy === column.key
                      ? sort.sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className={column.className ?? ''}
                  key={column.key}
                  scope="col"
                >
                  <SortButton column={column} onSort={onSort} sort={sort} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="orders-table-state" colSpan={columns.length}>
                  <span aria-hidden="true" className="orders-loading-indicator" />
                  Loading orders…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td className="orders-table-state" colSpan={columns.length}>
                  No orders match these filters.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  className={selectedOrderId === order.id ? 'order-row-selected' : ''}
                  key={order.id}
                >
                  <td>
                    <button
                      aria-pressed={selectedOrderId === order.id}
                      className="order-id-button"
                      onClick={(event) =>
                        onSelectOrder(order.id, event.currentTarget)
                      }
                      type="button"
                    >
                      {order.id}
                    </button>
                  </td>
                  <td>
                    <span className="orders-customer-name">
                      {order.customer?.name ?? 'Unknown customer'}
                    </span>
                    <span className="orders-customer-email">
                      {order.customer?.email ?? order.customerId}
                    </span>
                  </td>
                  <td className="orders-date-cell">
                    {dateFormatter.format(new Date(order.placedAt))}
                  </td>
                  <td>
                    <span
                      className={`order-status order-status-${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="orders-amount-cell">{formatBdt(order.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrdersDataTable
