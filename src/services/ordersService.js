import { customers } from '../data/customers.js'
import { orders } from '../data/orders.js'
import { products } from '../data/products.js'
import {
  createResponse,
  matchesText,
  MockApiError,
  mockRequest,
  normalizePagination,
} from './mockApi.js'
import { isValidDate } from '../utils/dateValidation.js'

const customerById = new Map(customers.map((customer) => [customer.id, customer]))
const productById = new Map(products.map((product) => [product.id, product]))

function includeCustomer(order) {
  const customer = customerById.get(order.customerId)

  return {
    ...order,
    customer: customer
      ? {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          city: customer.city,
        }
      : null,
    items: order.items.map((item) => {
      const product = productById.get(item.productId)

      return {
        ...item,
        product: product
          ? { id: product.id, name: product.name, sku: product.sku }
          : null,
      }
    }),
  }
}

const sortableFields = new Set([
  'id',
  'customer',
  'placedAt',
  'status',
  'total',
])

export async function getOrders({
  search = '',
  status = 'all',
  startDate = '',
  endDate = '',
  sortBy = 'placedAt',
  sortDirection = 'desc',
  page = 1,
  pageSize = 10,
  simulateError,
  failureRate,
  delayMs,
} = {}) {
  return mockRequest(
    'getOrders',
    () => {
      if (startDate && !isValidDate(startDate)) {
        throw new MockApiError('Start date must use YYYY-MM-DD format.', {
          status: 400,
          code: 'INVALID_START_DATE',
        })
      }

      if (endDate && !isValidDate(endDate)) {
        throw new MockApiError('End date must use YYYY-MM-DD format.', {
          status: 400,
          code: 'INVALID_END_DATE',
        })
      }

      if (startDate && endDate && startDate > endDate) {
        throw new MockApiError('Start date must be on or before end date.', {
          status: 400,
          code: 'INVALID_DATE_RANGE',
        })
      }

      if (!sortableFields.has(sortBy)) {
        throw new MockApiError(`Unsupported order sort field: ${sortBy}`, {
          status: 400,
          code: 'INVALID_SORT_FIELD',
        })
      }

      if (!['asc', 'desc'].includes(sortDirection)) {
        throw new MockApiError('Sort direction must be asc or desc.', {
          status: 400,
          code: 'INVALID_SORT_DIRECTION',
        })
      }

      const { page: currentPage, pageSize: currentPageSize } =
        normalizePagination(page, pageSize)
      const filteredOrders = orders.filter((order) => {
        const matchesStatus =
          String(status).toLowerCase() === 'all' ||
          order.status.toLowerCase() === String(status).toLowerCase()
        const customer = customerById.get(order.customerId)
        const matchesSearch =
          !search ||
          matchesText(order.id, search) ||
          matchesText(order.customerId, search) ||
          matchesText(customer?.name, search) ||
          matchesText(customer?.email, search)
        const orderDate = order.placedAt.slice(0, 10)
        const matchesStartDate = !startDate || orderDate >= startDate
        const matchesEndDate = !endDate || orderDate <= endDate

        return (
          matchesStatus &&
          matchesSearch &&
          matchesStartDate &&
          matchesEndDate
        )
      })
      const directionMultiplier = sortDirection === 'asc' ? 1 : -1
      const sortedOrders = filteredOrders
        .map((order) => ({
          order,
          value:
            sortBy === 'customer'
              ? customerById.get(order.customerId)?.name ?? ''
              : sortBy === 'placedAt'
                ? Date.parse(order.placedAt)
                : order[sortBy],
        }))
        .sort((left, right) => {
          const comparison =
            typeof left.value === 'number' && typeof right.value === 'number'
              ? left.value - right.value
              : String(left.value).localeCompare(
                  String(right.value),
                  undefined,
                  {
                    numeric: true,
                    sensitivity: 'base',
                  },
                )

          return comparison * directionMultiplier
        })

      const start = (currentPage - 1) * currentPageSize
      const pageOrders = sortedOrders
        .slice(start, start + currentPageSize)
        .map(({ order }) => includeCustomer(order))

      return createResponse(pageOrders, {
        total: filteredOrders.length,
        page: currentPage,
        pageSize: currentPageSize,
        totalPages: Math.ceil(filteredOrders.length / currentPageSize),
      })
    },
    { simulateError, failureRate, delayMs },
  )
}

export async function getOrderById(
  orderId,
  { simulateError, failureRate, delayMs } = {},
) {
  return mockRequest(
    'getOrderById',
    () => {
      const order = orders.find(
        (item) => item.id.toLowerCase() === String(orderId).toLowerCase(),
      )

      if (!order) {
        throw new MockApiError(`Order not found: ${orderId}`, {
          status: 404,
          code: 'ORDER_NOT_FOUND',
        })
      }

      return createResponse(includeCustomer(order), { total: 1 })
    },
    { simulateError, failureRate, delayMs },
  )
}
