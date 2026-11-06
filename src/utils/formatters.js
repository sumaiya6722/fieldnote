const compactBdtFormatter = new Intl.NumberFormat('en-BD', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatBdt(amount) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCompactBdt(amount) {
  return `৳${compactBdtFormatter.format(amount)}`
}

export function formatPercentageChange(change) {
  if (change === null || !Number.isFinite(change)) {
    return null
  }

  const roundedChange = Math.round(Math.abs(change))
  const sign = change > 0 ? '+' : change < 0 ? '−' : ''
  return `${sign}${roundedChange}%`
}

export function formatMonthPeriod(month) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T00:00:00Z`))
}
