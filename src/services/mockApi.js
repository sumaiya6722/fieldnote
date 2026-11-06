export const DEFAULT_MOCK_DELAY_MS = 300
export const DEFAULT_MOCK_FAILURE_RATE = 0.03

export class MockApiError extends Error {
  constructor(message, { status = 500, code = 'MOCK_API_ERROR' } = {}) {
    super(message)
    this.name = 'MockApiError'
    this.status = status
    this.code = code
  }
}

export function createResponse(data, meta = {}) {
  return { data: structuredClone(data), meta }
}

export function createPaginatedResponse(items, page, pageSize) {
  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize

  return createResponse(items.slice(start, start + pageSize), {
    total,
    page,
    pageSize,
    totalPages,
  })
}

export function normalizePagination(page = 1, pageSize = 10) {
  const normalizedPage = Math.max(1, Math.floor(Number(page) || 1))
  const normalizedPageSize = Math.min(
    100,
    Math.max(1, Math.floor(Number(pageSize) || 10)),
  )

  return { page: normalizedPage, pageSize: normalizedPageSize }
}

export function matchesText(value, search) {
  return String(value ?? '')
    .toLowerCase()
    .includes(String(search ?? '').trim().toLowerCase())
}

export async function mockRequest(
  operation,
  handler,
  {
    delayMs = DEFAULT_MOCK_DELAY_MS,
    failureRate = DEFAULT_MOCK_FAILURE_RATE,
    simulateError = false,
  } = {},
) {
  const delay = Math.max(0, Number(delayMs) || 0)
  const errorRate = Math.min(1, Math.max(0, Number(failureRate) || 0))

  await new Promise((resolve) => setTimeout(resolve, delay))

  if (simulateError || Math.random() < errorRate) {
    throw new MockApiError(`Mock API request failed: ${operation}`)
  }

  return handler()
}
