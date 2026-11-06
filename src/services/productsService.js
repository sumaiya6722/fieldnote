import { products } from '../data/products.js'
import {
  createPaginatedResponse,
  matchesText,
  mockRequest,
  normalizePagination,
} from './mockApi.js'

export async function getProducts({
  search = '',
  category = 'all',
  stockStatus = 'all',
  page = 1,
  pageSize = 10,
  simulateError,
  failureRate,
  delayMs,
} = {}) {
  return mockRequest(
    'getProducts',
    () => {
      const { page: currentPage, pageSize: currentPageSize } =
        normalizePagination(page, pageSize)
      const filteredProducts = products.filter((product) => {
        const matchesCategory =
          String(category).toLowerCase() === 'all' ||
          product.category.toLowerCase() === String(category).toLowerCase()
        const inventoryStatus =
          product.stock === 0
            ? 'out-of-stock'
            : product.stock <= product.reorderLevel
              ? 'low-stock'
              : 'in-stock'
        const matchesStock =
          String(stockStatus).toLowerCase() === 'all' ||
          inventoryStatus === String(stockStatus).toLowerCase()
        const matchesSearch =
          !search ||
          matchesText(product.name, search) ||
          matchesText(product.sku, search) ||
          matchesText(product.id, search)

        return matchesCategory && matchesStock && matchesSearch
      })

      return createPaginatedResponse(
        filteredProducts,
        currentPage,
        currentPageSize,
      )
    },
    { simulateError, failureRate, delayMs },
  )
}
