import { orders } from '../data/orders.js'
import { products } from '../data/products.js'
import { calculateAnalytics } from '../utils/analyticsCalculations.js'
import { createResponse, mockRequest } from './mockApi.js'

export async function getAnalytics({
  startDate = '',
  endDate = '',
  simulateError,
  failureRate,
  delayMs,
} = {}) {
  return mockRequest(
    'getAnalytics',
    () => createResponse(calculateAnalytics(orders, products, { startDate, endDate })),
    { simulateError, failureRate, delayMs },
  )
}
