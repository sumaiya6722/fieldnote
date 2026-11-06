import { formatBdt, formatPercentageChange } from '../utils/formatters.js'

function AnalyticsPerformanceSummary({ summary, previousPeriod }) {
  const revenueChange = formatPercentageChange(summary.revenueChange)
  const metrics = [
    {
      label: 'Delivered revenue',
      value: formatBdt(summary.revenue),
      detail:
        revenueChange === null
          ? 'No previous-period baseline'
          : `${revenueChange} vs previous period`,
      tone:
        summary.revenueChange === null
          ? 'muted'
          : summary.revenueChange >= 0
            ? 'positive'
            : 'negative',
    },
    {
      label: 'Orders',
      value: new Intl.NumberFormat('en-BD').format(summary.orderCount),
      detail: `${summary.deliveredOrders} delivered · ${summary.pendingOrders} pending`,
      tone: 'muted',
    },
    {
      label: 'Average order value',
      value: formatBdt(summary.averageOrderValue),
      detail: 'Delivered revenue ÷ delivered orders',
      tone: 'muted',
    },
    {
      label: 'Delivery rate',
      value: `${summary.deliveryRate}%`,
      detail: `${summary.cancelledOrders} cancelled (${summary.cancellationRate}%)`,
      tone: 'muted',
    },
  ]

  return (
    <section aria-label="Performance summary" className="analytics-summary">
      <div className="analytics-summary-heading">
        <div>
          <h2>Performance summary</h2>
          <p>
            {previousPeriod
              ? `Compared with ${previousPeriod.startDate} – ${previousPeriod.endDate}`
              : 'Based on the selected order date range'}
          </p>
        </div>
      </div>
      <div className="analytics-summary-grid">
        {metrics.map((metric) => (
          <article className="analytics-summary-card" key={metric.label}>
            <h3>{metric.label}</h3>
            <p className="analytics-summary-value">{metric.value}</p>
            <p className={`analytics-summary-detail analytics-detail-${metric.tone}`}>
              {metric.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default AnalyticsPerformanceSummary
