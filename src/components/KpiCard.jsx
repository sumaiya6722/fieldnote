import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import {
  formatBdt,
  formatMonthPeriod,
  formatPercentageChange,
} from '../utils/formatters.js'

function formatValue(value, format) {
  if (format === 'currency') {
    return formatBdt(value)
  }

  return new Intl.NumberFormat('en-BD').format(value)
}

function KpiComparison({ comparison }) {
  if (!comparison) {
    return (
      <span className="kpi-comparison-muted">
        Monthly comparison unavailable
      </span>
    )
  }

  const { change, currentMonth, previousMonth } = comparison
  const periodLabel = `${formatMonthPeriod(currentMonth)} vs ${formatMonthPeriod(previousMonth)}`

  if (change === null) {
    return (
      <span className="kpi-comparison-muted">
        No prior-period baseline{' '}
        <span className="kpi-period">{periodLabel}</span>
      </span>
    )
  }

  const isPositive = change > 0
  const isNeutral = change === 0
  const ChangeIcon = isNeutral
    ? Minus
    : isPositive
      ? ArrowUpRight
      : ArrowDownRight
  const formattedChange = formatPercentageChange(change)

  return (
    <span
      className={`kpi-comparison ${isNeutral ? 'kpi-comparison-neutral' : isPositive ? 'kpi-comparison-positive' : 'kpi-comparison-negative'}`}
    >
      <ChangeIcon aria-hidden="true" size={15} />
      {formattedChange}
      <span className="kpi-period">{periodLabel}</span>
    </span>
  )
}

function KpiCard({ title, value, format, Icon, comparison }) {
  return (
    <article
      aria-label={`${title}: ${formatValue(value, format)}`}
      className="kpi-card"
    >
      <div className="kpi-card-top">
        <h2 className="kpi-card-title">{title}</h2>
        <span aria-hidden="true" className="kpi-card-icon">
          <Icon size={19} strokeWidth={1.8} />
        </span>
      </div>
      <p className="kpi-card-value">{formatValue(value, format)}</p>
      <div className="kpi-card-footer">
        <KpiComparison comparison={comparison} />
      </div>
    </article>
  )
}

export default KpiCard
