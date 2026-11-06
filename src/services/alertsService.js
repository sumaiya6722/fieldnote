import { operationalAlerts } from '../data/operationalAlerts.js'
import {
  createPaginatedResponse,
  createResponse,
  MockApiError,
  matchesText,
  mockRequest,
  normalizePagination,
} from './mockApi.js'

export async function getAlerts({
  search = '',
  severity = 'all',
  status = 'all',
  page = 1,
  pageSize = 10,
  simulateError,
  failureRate,
  delayMs,
} = {}) {
  return mockRequest(
    'getAlerts',
    () => {
      const { page: currentPage, pageSize: currentPageSize } =
        normalizePagination(page, pageSize)
      const filteredAlerts = operationalAlerts.filter((alert) => {
        const matchesSeverity =
          String(severity).toLowerCase() === 'all' ||
          alert.severity.toLowerCase() === String(severity).toLowerCase()
        const matchesStatus =
          String(status).toLowerCase() === 'all' ||
          alert.status.toLowerCase() === String(status).toLowerCase()
        const matchesSearch =
          !search ||
          matchesText(alert.title, search) ||
          matchesText(alert.description, search) ||
          matchesText(alert.productId, search) ||
          matchesText(alert.orderId, search)

        return matchesSeverity && matchesStatus && matchesSearch
      })

      return createPaginatedResponse(
        filteredAlerts,
        currentPage,
        currentPageSize,
      )
    },
    { simulateError, failureRate, delayMs },
  )
}

export async function resolveAlertById(
  alertId,
  { simulateError, failureRate, delayMs } = {},
) {
  return mockRequest(
    'resolveAlertById',
    () => {
      const alert = operationalAlerts.find((item) => item.id === alertId)

      if (!alert) {
        throw new MockApiError(`Alert not found: ${alertId}`, {
          status: 404,
          code: 'ALERT_NOT_FOUND',
        })
      }

      if (alert.status !== 'resolved') {
        alert.status = 'resolved'
        alert.resolvedAt = new Date().toISOString()
      }

      return createResponse(alert, { total: 1 })
    },
    { simulateError, failureRate, delayMs },
  )
}
