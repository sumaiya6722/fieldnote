import { isValidDate } from './dateValidation.js'

const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
]

export function validateAnalyticsDateRange({
  startDate = '',
  endDate = '',
}) {
  if (startDate && !isValidDate(startDate)) {
    return { field: 'startDate', message: 'Enter a valid start date.' }
  }

  if (endDate && !isValidDate(endDate)) {
    return { field: 'endDate', message: 'Enter a valid end date.' }
  }

  if (startDate && endDate && startDate > endDate) {
    return {
      field: 'endDate',
      message: 'End date must be on or after the start date.',
    }
  }

  return null
}

function getDateBounds(orders, startDate, endDate) {
  let firstDate = ''
  let lastDate = ''

  for (const order of orders) {
    const date = order.placedAt?.slice(0, 10)
    if (!date || !isValidDate(date)) {
      continue
    }

    if (!firstDate || date < firstDate) {
      firstDate = date
    }
    if (!lastDate || date > lastDate) {
      lastDate = date
    }
  }

  return {
    startDate: startDate || firstDate,
    endDate: endDate || lastDate,
  }
}

function monthKeysBetween(startDate, endDate) {
  if (!startDate || !endDate) {
    return []
  }

  const start = new Date(`${startDate.slice(0, 7)}-01T00:00:00.000Z`)
  const end = new Date(`${endDate.slice(0, 7)}-01T00:00:00.000Z`)
  const months = []

  for (
    let cursor = start;
    cursor <= end;
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  ) {
    months.push(cursor.toISOString().slice(0, 7))
  }

  return months
}

function previousMonthKey(month) {
  const date = new Date(`${month}-01T00:00:00.000Z`)
  date.setUTCMonth(date.getUTCMonth() - 1)
  return date.toISOString().slice(0, 7)
}

function calculatePercentageChange(current, previous) {
  if (previous === 0) {
    return null
  }

  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function summarizeOrders(ordersInRange) {
  const summary = ordersInRange.reduce(
    (result, order) => {
      result.orderCount += 1
      result.statusCounts[order.status] =
        (result.statusCounts[order.status] ?? 0) + 1

      if (order.status === 'Delivered') {
        result.deliveredOrders += 1
        result.revenue += order.total
      }

      if (order.status === 'Pending') {
        result.pendingOrders += 1
      }

      if (order.status === 'Cancelled') {
        result.cancelledOrders += 1
      }

      return result
    },
    {
      orderCount: 0,
      deliveredOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      revenue: 0,
      statusCounts: {},
    },
  )

  return summary
}

function calculateTopSellingProducts(ordersInRange, products) {
  const productTotals = new Map()
  const productById = new Map(products.map((product) => [product.id, product]))

  for (const order of ordersInRange) {
    if (order.status === 'Cancelled') {
      continue
    }

    for (const item of order.items) {
      const product = productById.get(item.productId)
      if (!product) {
        continue
      }

      const totals = productTotals.get(item.productId) ?? {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitsSold: 0,
        revenue: 0,
      }
      totals.unitsSold += item.quantity
      totals.revenue += item.lineTotal
      productTotals.set(item.productId, totals)
    }
  }

  return [...productTotals.values()]
    .sort(
      (left, right) =>
        right.unitsSold - left.unitsSold || right.revenue - left.revenue,
    )
    .slice(0, 5)
}

function calculatePreviousPeriodRevenue(orders, startDate, endDate) {
  if (!startDate || !endDate) {
    return null
  }

  const start = new Date(`${startDate}T00:00:00.000Z`)
  const end = new Date(`${endDate}T00:00:00.000Z`)
  const days = Math.round((end - start) / 86_400_000) + 1
  const previousStart = new Date(start)
  previousStart.setUTCDate(previousStart.getUTCDate() - days)

  const previousOrders = orders.filter((order) => {
    const date = order.placedAt.slice(0, 10)
    return (
      date >= previousStart.toISOString().slice(0, 10) && date < startDate
    )
  })

  return {
    startDate: previousStart.toISOString().slice(0, 10),
    endDate: new Date(start.getTime() - 86_400_000)
      .toISOString()
      .slice(0, 10),
    revenue: previousOrders.reduce(
      (total, order) =>
        order.status === 'Delivered' ? total + order.total : total,
      0,
    ),
  }
}

export function calculateAnalytics(orders, products, filters = {}) {
  if (!Array.isArray(orders) || !Array.isArray(products)) {
    throw new TypeError('Expected orders and products arrays')
  }

  const { startDate = '', endDate = '' } = filters

  const validationError = validateAnalyticsDateRange({ startDate, endDate })
  if (validationError) {
    throw new RangeError(validationError.message)
  }

  const period = getDateBounds(orders, startDate, endDate)
  const ordersInRange = orders.filter((order) => {
    const date = order.placedAt.slice(0, 10)
    return (
      (!period.startDate || date >= period.startDate) &&
      (!period.endDate || date <= period.endDate)
    )
  })
  const totals = summarizeOrders(ordersInRange)
  const previousPeriod = calculatePreviousPeriodRevenue(
    orders,
    period.startDate,
    period.endDate,
  )
  const ordersByMonth = new Map()
  const revenueByMonth = new Map()

  for (const order of ordersInRange) {
    const month = order.placedAt.slice(0, 7)
    const monthOrders = ordersByMonth.get(month) ?? []
    monthOrders.push(order)
    ordersByMonth.set(month, monthOrders)
  }

  for (const order of orders) {
    if (order.status === 'Delivered') {
      const month = order.placedAt.slice(0, 7)
      revenueByMonth.set(
        month,
        (revenueByMonth.get(month) ?? 0) + order.total,
      )
    }
  }
  const monthlySales = monthKeysBetween(
    period.startDate,
    period.endDate,
  ).map((month) => {
    const monthOrders = ordersByMonth.get(month) ?? []
    const revenue = monthOrders.reduce(
      (total, order) =>
        order.status === 'Delivered' ? total + order.total : total,
      0,
    )
    const previousMonth = previousMonthKey(month)
    const previousMonthRevenue = revenueByMonth.get(previousMonth) ?? 0

    return {
      month,
      orderCount: monthOrders.length,
      deliveredOrders: monthOrders.filter(
        (order) => order.status === 'Delivered',
      ).length,
      revenue,
      previousMonthRevenue,
      currency: 'BDT',
    }
  })
  const dailyRevenue = new Map()

  for (const order of ordersInRange) {
    if (order.status !== 'Delivered') {
      continue
    }

    const date = order.placedAt.slice(0, 10)
    dailyRevenue.set(date, (dailyRevenue.get(date) ?? 0) + order.total)
  }

  const orderStatusDistribution = ORDER_STATUSES.map((status) => ({
    status,
    count: totals.statusCounts[status] ?? 0,
  }))
  const previousRevenue = previousPeriod?.revenue ?? null
  const nonCancelledOrders = totals.orderCount - totals.cancelledOrders

  return {
    currency: 'BDT',
    period,
    monthlySales,
    salesTrend: [...dailyRevenue.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, revenue]) => ({ date, revenue, currency: 'BDT' })),
    orderStatusDistribution,
    topSellingProducts: calculateTopSellingProducts(ordersInRange, products),
    previousPeriod,
    summary: {
      orderCount: totals.orderCount,
      deliveredOrders: totals.deliveredOrders,
      pendingOrders: totals.pendingOrders,
      cancelledOrders: totals.cancelledOrders,
      revenue: totals.revenue,
      averageOrderValue:
        totals.deliveredOrders > 0
          ? Number((totals.revenue / totals.deliveredOrders).toFixed(2))
          : 0,
      deliveryRate:
        nonCancelledOrders > 0
          ? Number(
              ((totals.deliveredOrders / nonCancelledOrders) * 100).toFixed(1),
            )
          : 0,
      cancellationRate:
        totals.orderCount > 0
          ? Number(
              ((totals.cancelledOrders / totals.orderCount) * 100).toFixed(1),
            )
          : 0,
      revenueChange:
        previousRevenue === null
          ? null
          : calculatePercentageChange(totals.revenue, previousRevenue),
      previousPeriodRevenue: previousRevenue,
    },
  }
}

export { ORDER_STATUSES }
