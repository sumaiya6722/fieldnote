import { AlertTriangle, Clock3, PackageX } from 'lucide-react'

const alertIcons = {
  'delayed-order': Clock3,
  'low-stock': AlertTriangle,
  'out-of-stock': PackageX,
}

const alertDateFormatter = new Intl.DateTimeFormat('en-BD', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Dhaka',
})

function OperationalAlertsPreview({ alerts, error, onRetry }) {
  return (
    <section aria-label="Operational alerts" className="overview-panel alerts-panel">
      <div className="overview-panel-heading">
        <div>
          <h2>Operational alerts</h2>
          <p>Issues that may need your attention</p>
        </div>
        {alerts?.length > 0 && (
          <span className="alert-count">{alerts.length}</span>
        )}
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
      ) : !alerts?.length ? (
        <p className="panel-state" role="status">
          No operational alerts.
        </p>
      ) : (
        <ul className="alerts-list">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type] ?? AlertTriangle

            return (
              <li className="alert-item" key={alert.id}>
                <span
                  aria-hidden="true"
                  className={`alert-icon alert-icon-${alert.severity.toLowerCase()}`}
                >
                  <Icon size={16} />
                </span>
                <div className="alert-copy">
                  <p className="alert-title">{alert.title}</p>
                  <p className="alert-description">{alert.description}</p>
                  <span className="alert-meta">
                    <span className={`alert-severity alert-severity-${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                    {alertDateFormatter.format(new Date(alert.createdAt))}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default OperationalAlertsPreview
