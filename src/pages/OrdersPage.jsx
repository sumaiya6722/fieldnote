import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CalendarDays, RotateCcw, Search } from 'lucide-react'
import OrderDetailsPanel from '../components/OrderDetailsPanel.jsx'
import OrdersDataTable from '../components/OrdersDataTable.jsx'
import { getOrderById, getOrders } from '../services/ordersService.js'
import { isValidDate } from '../utils/dateValidation.js'
import './OrdersPage.css'

const PAGE_SIZE = 8
const INITIAL_FILTERS = {
  search: '',
  status: 'all',
  startDate: '',
  endDate: '',
}

function validateDateRange({ startDate, endDate }) {
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

function OrdersPage() {
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS)
  const [dateError, setDateError] = useState(null)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({
    sortBy: 'placedAt',
    sortDirection: 'desc',
  })
  const [requestNumber, setRequestNumber] = useState(0)
  const [listState, setListState] = useState(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [detailRequestNumber, setDetailRequestNumber] = useState(0)
  const [detailState, setDetailState] = useState(null)
  const listRequestSequence = useRef(0)
  const detailRequestSequence = useRef(0)
  const selectedOrderButtonRef = useRef(null)

  const queryOptions = useMemo(
    () => ({
      ...appliedFilters,
      ...sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    [appliedFilters, page, sort],
  )
  const queryKey = JSON.stringify(queryOptions)

  useEffect(() => {
    const requestSequence = ++listRequestSequence.current

    getOrders(queryOptions)
      .then((response) => {
        if (requestSequence === listRequestSequence.current) {
          setListState({ queryKey, status: 'success', response })
        }
      })
      .catch((error) => {
        if (requestSequence === listRequestSequence.current) {
          setListState({ queryKey, status: 'error', error })
        }
      })

    return () => {
      listRequestSequence.current += 1
    }
  }, [queryKey, queryOptions, requestNumber])

  useEffect(() => {
    if (!selectedOrderId) {
      return undefined
    }

    const requestSequence = ++detailRequestSequence.current

    getOrderById(selectedOrderId)
      .then((response) => {
        if (requestSequence === detailRequestSequence.current) {
          setDetailState({
            orderId: selectedOrderId,
            requestNumber: detailRequestNumber,
            status: 'success',
            order: response.data,
          })
        }
      })
      .catch((error) => {
        if (requestSequence === detailRequestSequence.current) {
          setDetailState({
            orderId: selectedOrderId,
            requestNumber: detailRequestNumber,
            status: 'error',
            error,
          })
        }
      })

    return () => {
      detailRequestSequence.current += 1
    }
  }, [selectedOrderId, detailRequestNumber])

  const currentListState =
    listState?.queryKey === queryKey ? listState : null
  const isLoading = currentListState === null
  const listError =
    currentListState?.status === 'error' ? currentListState.error : null
  const response =
    currentListState?.status === 'success'
      ? currentListState.response
      : null
  const orders = response?.data ?? []
  const pagination = response?.meta
  const selectedDetail =
    detailState?.orderId === selectedOrderId &&
    detailState?.requestNumber === detailRequestNumber
      ? detailState
      : null

  function updateDraftFilter(event) {
    const { name, value } = event.target
    setDraftFilters((current) => ({ ...current, [name]: value }))
    if (name === 'startDate' || name === 'endDate') {
      setDateError(null)
    }
  }

  function applyFilters(event) {
    event.preventDefault()
    const validationError = validateDateRange(draftFilters)

    if (validationError) {
      setDateError(validationError)
      return
    }

    setDateError(null)
    setPage(1)
    setAppliedFilters({ ...draftFilters })
    setSelectedOrderId(null)
  }

  function clearFilters() {
    setDateError(null)
    setDraftFilters(INITIAL_FILTERS)
    setAppliedFilters(INITIAL_FILTERS)
    setPage(1)
    setSelectedOrderId(null)
  }

  function changeSort(sortBy) {
    setPage(1)
    setSort((current) => ({
      sortBy,
      sortDirection:
        current.sortBy === sortBy && current.sortDirection === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }

  function selectOrder(orderId, triggerButton) {
    selectedOrderButtonRef.current = triggerButton
    setSelectedOrderId((current) => (current === orderId ? null : orderId))
  }

  const closeOrderDetails = useCallback(() => {
    setSelectedOrderId(null)
    requestAnimationFrame(() => selectedOrderButtonRef.current?.focus())
  }, [])

  function retryList() {
    setRequestNumber((current) => current + 1)
  }

  function retryDetails() {
    setDetailRequestNumber((current) => current + 1)
  }

  const hasActiveFilters =
    Object.values(appliedFilters).some(Boolean) ||
    Object.values(draftFilters).some(Boolean)

  return (
    <section aria-label="Orders management" className="orders-page">
      <div className="orders-page-heading">
        <div>
          <h2>Orders management</h2>
          <p>Search, review, and manage customer orders.</p>
        </div>
      </div>

      <form
        className="orders-filter-panel"
        noValidate
        onSubmit={applyFilters}
      >
        <div className="orders-filter-fields">
          <label className="orders-search-field">
            <span>Search orders</span>
            <span className="orders-input-wrap">
              <Search aria-hidden="true" size={17} />
              <input
                autoComplete="off"
                name="search"
                onChange={updateDraftFilter}
                placeholder="Order ID or customer name"
                type="search"
                value={draftFilters.search}
              />
            </span>
          </label>

          <label className="orders-status-field">
            <span>Order status</span>
            <select
              name="status"
              onChange={updateDraftFilter}
              value={draftFilters.status}
            >
              <option value="all">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          <fieldset
            className="orders-date-fieldset"
          >
            <legend>
              <CalendarDays aria-hidden="true" size={14} />
              Date range
            </legend>
            <label>
              <span className="visually-hidden">Start date</span>
              <input
                aria-invalid={dateError?.field === 'startDate'}
                aria-label="Start date"
                aria-describedby={dateError?.field === 'startDate' ? 'order-date-error' : undefined}
                name="startDate"
                onChange={updateDraftFilter}
                type="date"
                value={draftFilters.startDate}
              />
            </label>
            <span aria-hidden="true" className="date-range-divider">
              to
            </span>
            <label>
              <span className="visually-hidden">End date</span>
              <input
                aria-invalid={dateError?.field === 'endDate'}
                aria-label="End date"
                aria-describedby={dateError?.field === 'endDate' ? 'order-date-error' : undefined}
                name="endDate"
                onChange={updateDraftFilter}
                type="date"
                value={draftFilters.endDate}
              />
            </label>
          </fieldset>

          <div className="orders-filter-actions">
            <button className="orders-apply-button" type="submit">
              Apply filters
            </button>
            <button
              aria-label="Clear all order filters"
              className="orders-clear-button"
              onClick={clearFilters}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={15} />
              Clear
            </button>
          </div>
        </div>
        {dateError && (
          <p className="date-filter-error" id="order-date-error" role="alert">
            <AlertCircle aria-hidden="true" size={15} />
            {dateError.message}
          </p>
        )}
      </form>

      {listError ? (
        <section className="orders-state orders-error-state" role="alert">
          <AlertCircle aria-hidden="true" size={20} />
          <div>
            <h3>Orders couldn’t be loaded</h3>
            <p>{listError.message}</p>
          </div>
          <button onClick={retryList} type="button">
            Try again
          </button>
        </section>
      ) : (
        <>
          <div className="orders-results-heading">
            <p role="status">
              {isLoading
                ? 'Loading orders…'
                : `${pagination?.total ?? 0} ${pagination?.total === 1 ? 'order' : 'orders'} found`}
            </p>
            {hasActiveFilters && (
              <span className="orders-filter-note">
                Filters apply together across the full order list
              </span>
            )}
          </div>

          <div
            aria-busy={isLoading}
            className={`orders-content-grid${selectedOrderId ? ' orders-content-grid-selected' : ''}`}
          >
            <div className="orders-list-column">
              <OrdersDataTable
                isLoading={isLoading}
                onSelectOrder={selectOrder}
                onSort={changeSort}
                orders={orders}
                selectedOrderId={selectedOrderId}
                sort={sort}
              />

              {pagination && pagination.total > 0 && (
                <nav aria-label="Orders pagination" className="orders-pagination">
                  <p>
                    Showing {(pagination.page - 1) * pagination.pageSize + 1}–
                    {Math.min(
                      pagination.page * pagination.pageSize,
                      pagination.total,
                    )}{' '}
                    of {pagination.total}
                  </p>
                  <div className="pagination-controls">
                    <button
                      disabled={page <= 1 || isLoading}
                      onClick={() => setPage((current) => current - 1)}
                      type="button"
                    >
                      Previous
                    </button>
                    <span aria-current="page">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      disabled={page >= pagination.totalPages || isLoading}
                      onClick={() => setPage((current) => current + 1)}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </nav>
              )}
            </div>

            {selectedOrderId && (
              <OrderDetailsPanel
                error={selectedDetail?.status === 'error' ? selectedDetail.error : null}
                isLoading={!selectedDetail}
                onClose={closeOrderDetails}
                onRetry={retryDetails}
                order={
                  selectedDetail?.status === 'success'
                    ? selectedDetail.order
                    : null
                }
              />
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default OrdersPage
