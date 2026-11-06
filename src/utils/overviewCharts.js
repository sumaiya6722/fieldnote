import { formatMonthPeriod } from './formatters.js'

export const ORDER_STATUS_SERIES = [
  { key: 'Pending', label: 'Pending', color: '#e6a23c' },
  { key: 'Processing', label: 'Processing', color: '#5684e8' },
  { key: 'Shipped', label: 'Shipped', color: '#8a6bd6' },
  { key: 'Delivered', label: 'Delivered', color: '#31a77b' },
  { key: 'Cancelled', label: 'Cancelled', color: '#e36c6c' },
]

export function prepareRevenueTrendData(monthlySales) {
  if (!Array.isArray(monthlySales)) {
    return []
  }

  return monthlySales
    .filter(
      (month) =>
        typeof month.month === 'string' && Number.isFinite(month.revenue),
    )
    .map((month) => ({
      ...month,
      label: formatMonthPeriod(month.month),
    }))
    .sort((left, right) => left.month.localeCompare(right.month))
}

export function prepareOrdersOverviewData(orders) {
  if (!Array.isArray(orders)) {
    return []
  }

  const monthlyOrders = new Map()

  for (const order of orders) {
    if (typeof order.placedAt !== 'string') {
      continue
    }

    const month = order.placedAt.slice(0, 7)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      continue
    }

    const monthData = monthlyOrders.get(month) ?? {
      month,
      label: formatMonthPeriod(month),
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    }
    const status = ORDER_STATUS_SERIES.find(
      (item) => item.key.toLowerCase() === order.status?.toLowerCase(),
    )

    if (status) {
      monthData[status.key] += 1
      monthlyOrders.set(month, monthData)
    }
  }

  return [...monthlyOrders.values()].sort((left, right) =>
    left.month.localeCompare(right.month),
  )
}
