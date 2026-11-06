function monthForDate(date) {
  return date.slice(0, 7)
}

function createPeriodSummary(orders) {
  return orders.reduce(
    (summary, order) => {
      const status = order.status.toLowerCase()
      summary.orders += 1

      if (status === 'delivered') {
        summary.revenue += order.total
        summary.delivered += 1
      }

      if (status === 'pending') {
        summary.pending += 1
      }

      return summary
    },
    { revenue: 0, orders: 0, pending: 0, delivered: 0 },
  )
}

function getPercentageChange(current, previous) {
  if (previous === 0) {
    return null
  }

  return ((current - previous) / previous) * 100
}

export function calculateDashboardKpis(orders) {
  if (!Array.isArray(orders)) {
    throw new TypeError('Expected an array of orders')
  }

  const totals = createPeriodSummary(orders)
  const ordersByMonth = new Map()

  for (const order of orders) {
    const month = monthForDate(order.placedAt)
    const monthlyOrders = ordersByMonth.get(month) ?? []
    monthlyOrders.push(order)
    ordersByMonth.set(month, monthlyOrders)
  }

  const months = [...ordersByMonth.keys()].sort()
  const currentMonth = months.at(-1)
  const previousMonth = months.at(-2)
  const currentPeriod = currentMonth
    ? createPeriodSummary(ordersByMonth.get(currentMonth))
    : null
  const previousPeriod = previousMonth
    ? createPeriodSummary(ordersByMonth.get(previousMonth))
    : null

  const comparisonFor = (metric) =>
    currentPeriod && previousPeriod
      ? {
          change: getPercentageChange(
            currentPeriod[metric],
            previousPeriod[metric],
          ),
          currentMonth,
          previousMonth,
        }
      : null

  return [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: totals.revenue,
      format: 'currency',
      comparison: comparisonFor('revenue'),
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: totals.orders,
      format: 'number',
      comparison: comparisonFor('orders'),
    },
    {
      id: 'pending',
      title: 'Pending Orders',
      value: totals.pending,
      format: 'number',
      comparison: comparisonFor('pending'),
    },
    {
      id: 'delivered',
      title: 'Delivered Orders',
      value: totals.delivered,
      format: 'number',
      comparison: comparisonFor('delivered'),
    },
  ]
}
