function ChartCard({ title, description, children, isEmpty, error, onRetry }) {
  return (
    <section aria-label={title} className="overview-panel chart-panel">
      <div className="overview-panel-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
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
      ) : isEmpty ? (
        <p className="panel-state" role="status">
          No chart data is available yet.
        </p>
      ) : (
        children
      )}
    </section>
  )
}

export default ChartCard
