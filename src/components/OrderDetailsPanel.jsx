import { useEffect } from 'react'
import { X } from 'lucide-react'
import { formatBdt } from '../utils/formatters.js'

const dateTimeFormatter = new Intl.DateTimeFormat('en-BD', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Dhaka',
})

function formatDateTime(value) {
  return value ? dateTimeFormatter.format(new Date(value)) : 'Not available'
}

function OrderDetailsPanel({ order, isLoading, error, onRetry, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <aside aria-labelledby="order-details-title" className="order-details-panel">
      <div className="order-details-heading">
        <div>
          <p className="order-details-eyebrow">Selected order</p>
          <h2 id="order-details-title">{order?.id ?? 'Order details'}</h2>
        </div>
        <button
          aria-label="Close order details"
          className="order-details-close"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      {isLoading ? (
        <p className="order-detail-state" role="status">
          Loading order details…
        </p>
      ) : error ? (
        <div className="order-detail-state order-detail-error" role="alert">
          <p>{error.message}</p>
          <button onClick={onRetry} type="button">
            Try again
          </button>
        </div>
      ) : order ? (
        <>
          <div className="order-detail-customer">
            <span className="orders-customer-name">{order.customer?.name}</span>
            <span>{order.customer?.email}</span>
            <span>{order.customer?.city}</span>
          </div>

          <dl className="order-detail-meta">
            <div>
              <dt>Status</dt>
              <dd>
                <span
                  className={`order-status order-status-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </span>
              </dd>
            </div>
            <div>
              <dt>Placed</dt>
              <dd>{formatDateTime(order.placedAt)}</dd>
            </div>
            <div>
              <dt>Expected delivery</dt>
              <dd>{formatDateTime(order.expectedDeliveryAt)}</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>
                {order.paymentMethod} · {order.paymentStatus}
              </dd>
            </div>
            {order.trackingNumber && (
              <div>
                <dt>Tracking</dt>
                <dd>{order.trackingNumber}</dd>
              </div>
            )}
            {order.cancellationReason && (
              <div>
                <dt>Cancellation</dt>
                <dd>{order.cancellationReason}</dd>
              </div>
            )}
          </dl>

          <h3 className="order-items-heading">Items</h3>
          <ul className="order-items-list">
            {order.items.map((item) => (
              <li key={item.productId}>
                <div>
                  <span>{item.product?.name ?? item.productId}</span>
                  <small>
                    {item.product?.sku ?? item.productId} · Qty {item.quantity}
                  </small>
                </div>
                <strong>{formatBdt(item.lineTotal)}</strong>
              </li>
            ))}
          </ul>

          <dl className="order-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatBdt(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>−{formatBdt(order.discount)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{formatBdt(order.shipping)}</dd>
            </div>
            <div className="order-total">
              <dt>Total</dt>
              <dd>{formatBdt(order.total)}</dd>
            </div>
          </dl>
        </>
      ) : null}
    </aside>
  )
}

export default OrderDetailsPanel
