import {
  AlertTriangle,
  Check,
  Clock3,
  PackageX,
} from 'lucide-react'

const icons = {
  'delayed-order': Clock3,
  'low-stock': AlertTriangle,
  'out-of-stock': PackageX,
}

function InventoryAlertList({
  title,
  description,
  alerts,
  isLoading,
  error,
  onRetry,
  onResolve,
  pendingAlertId,
}) {
  return (
    <section aria-label={title} className="inventory-panel inventory-alert-panel">
      <div className="inventory-section-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {!isLoading && !error && (
          <span className="inventory-alert-count">{alerts.length}</span>
        )}
      </div>

      {isLoading ? (
        <p className="inventory-alert-state" role="status">Loading alerts…</p>
      ) : error ? (
        <div className="inventory-alert-state inventory-error" role="alert">
          <span>{error.message}</span>
          <button onClick={onRetry} type="button">Retry</button>
        </div>
      ) : alerts.length === 0 ? (
        <p className="inventory-alert-state" role="status">
          No {title.toLowerCase()} to display.
        </p>
      ) : (
        <ul className="inventory-alert-list">
          {alerts.map((alert) => {
            const Icon = icons[alert.type] ?? AlertTriangle
            const isResolved = alert.status === 'resolved'
            const isPending = pendingAlertId === alert.id

            return (
              <li className={`inventory-alert-item${isResolved ? ' inventory-alert-resolved' : ''}`} key={alert.id}>
                <span
                  aria-hidden="true"
                  className={`inventory-alert-icon inventory-alert-icon-${alert.severity.toLowerCase()}`}
                >
                  {isResolved ? <Check size={16} /> : <Icon size={16} />}
                </span>
                <div className="inventory-alert-copy">
                  <div className="inventory-alert-title-line">
                    <h3>{alert.title}</h3>
                    <span className={`severity-badge severity-${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p>{alert.description}</p>
                  <span className="inventory-alert-meta">
                    {alert.orderId ?? alert.productId} · {alert.status}
                  </span>
                </div>
                {isResolved ? (
                  <span className="resolved-label">Resolved</span>
                ) : (
                  <button
                    aria-label={`Resolve alert: ${alert.title}`}
                    className="resolve-alert-button"
                    disabled={isPending}
                    onClick={() => onResolve(alert)}
                    type="button"
                  >
                    {isPending ? 'Saving…' : 'Resolve'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default InventoryAlertList
