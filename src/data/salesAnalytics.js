import { orders } from './orders.js'

const monthlyTotals = new Map()

for (const order of orders) {
  const month = order.placedAt.slice(0, 7)
  const totals = monthlyTotals.get(month) ?? {
    month,
    orderCount: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    revenue: 0,
  }

  totals.orderCount += 1
  if (order.status === 'Delivered') {
    totals.deliveredOrders += 1
    totals.revenue += order.total
  }
  if (order.status === 'Cancelled') {
    totals.cancelledOrders += 1
  }

  monthlyTotals.set(month, totals)
}

export const salesAnalytics = {
  currency: 'BDT',
  period: {
    start: '2026-06-01',
    end: '2026-11-06',
  },
  monthlySales: [...monthlyTotals.values()].map((month) => ({
    ...month,
    averageOrderValue:
      month.deliveredOrders === 0
        ? 0
        : Number((month.revenue / month.deliveredOrders).toFixed(2)),
  })),
  summary: {
    orderCount: orders.length,
    deliveredOrders: [...monthlyTotals.values()].reduce(
      (total, month) => total + month.deliveredOrders,
      0,
    ),
    cancelledOrders: [...monthlyTotals.values()].reduce(
      (total, month) => total + month.cancelledOrders,
      0,
    ),
    revenue: [...monthlyTotals.values()].reduce(
      (total, month) => total + month.revenue,
      0,
    ),
    averageOrderValue: 0,
  },
}

salesAnalytics.summary.averageOrderValue =
  salesAnalytics.summary.deliveredOrders === 0
    ? 0
    : Number(
        (
          salesAnalytics.summary.revenue /
          salesAnalytics.summary.deliveredOrders
        ).toFixed(2),
      )
