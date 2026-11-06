import { formatBdt } from '../utils/formatters.js'

const dateFormatter = new Intl.DateTimeFormat('en-BD', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Dhaka',
})

function RecentOrdersTable({ orders, error, onRetry }) {
  return (
    <section aria-label="Recent orders" className="overview-panel table-panel">
      <div className="overview-panel-heading">
        <div>
          <h2>Recent orders</h2>
          <p>Latest activity across your store</p>
        </div>
      </div>
      {error ? (
        <div className="panel-state" role="alert">
          <p>{error.message}</p>
          {onRetry && (
            <button className="panel-retry-button" onClick={onRetry} type="button">
              Retry
            </button>
          )}
        </div>
      ) : !orders?.length ? (
        <p className="panel-state" role="status">
          No recent orders to display.
        </p>
      ) : (
        <div
          aria-label="Scrollable recent orders table"
          className="table-scroll"
          role="region"
          tabIndex={0}
        >
          <table className="recent-orders-table">
            <caption className="visually-hidden">Recent store orders</caption>
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th className="amount-cell" scope="col">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id-cell">{order.id}</td>
                  <td>
                    <span className="customer-name">
                      {order.customer?.name ?? order.customerId}
                    </span>
                    {order.customer?.city && (
                      <span className="customer-city">{order.customer.city}</span>
                    )}
                  </td>
                  <td className="date-cell">
                    {dateFormatter.format(new Date(order.placedAt))}
                  </td>
                  <td>
                    <span
                      className={`order-status order-status-${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="amount-cell">{formatBdt(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default RecentOrdersTable
