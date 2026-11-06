import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import ConfirmResolveDialog from '../components/ConfirmResolveDialog.jsx'
import InventoryAlertList from '../components/InventoryAlertList.jsx'
import InventoryTable from '../components/InventoryTable.jsx'
import LowStockProducts from '../components/LowStockProducts.jsx'
import { getAlerts, resolveAlertById } from '../services/alertsService.js'
import { getProducts } from '../services/productsService.js'
import './InventoryPage.css'

const EMPTY_PRODUCTS = []
const EMPTY_ALERTS = []

function InventoryPage() {
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [reloadNumber, setReloadNumber] = useState(0)
  const [requestState, setRequestState] = useState(null)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [isResolving, setIsResolving] = useState(false)
  const [resolveError, setResolveError] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const requestSequence = useRef(0)
  const feedbackRef = useRef(null)

  useEffect(() => {
    if (feedback) {
      feedbackRef.current?.focus()
    }
  }, [feedback])

  useEffect(() => {
    const requestId = ++requestSequence.current

    Promise.allSettled([
      getProducts({ page: 1, pageSize: 100 }),
      getAlerts({ page: 1, pageSize: 100 }),
    ]).then(([productsResult, alertsResult]) => {
      if (requestId !== requestSequence.current) {
        return
      }

      setRequestState({
        reloadNumber,
        products:
          productsResult.status === 'fulfilled'
            ? productsResult.value.data
            : [],
        productsError:
          productsResult.status === 'rejected'
            ? productsResult.reason
            : null,
        alerts:
          alertsResult.status === 'fulfilled' ? alertsResult.value.data : [],
        alertsError:
          alertsResult.status === 'rejected' ? alertsResult.reason : null,
      })
    })

    return () => {
      requestSequence.current += 1
    }
  }, [reloadNumber])

  const currentRequest =
    requestState?.reloadNumber === reloadNumber ? requestState : null
  const isLoading = currentRequest === null
  const allProducts = currentRequest?.products ?? EMPTY_PRODUCTS
  const productsError = currentRequest?.productsError ?? null
  const alerts = currentRequest?.alerts ?? EMPTY_ALERTS
  const alertsError = currentRequest?.alertsError ?? null
  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return allProducts.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.sku.toLowerCase().includes(normalizedSearch) ||
        product.id.toLowerCase().includes(normalizedSearch)
      const productStockStatus =
        product.stock === 0
          ? 'out-of-stock'
          : product.stock <= product.reorderLevel
            ? 'low-stock'
            : 'in-stock'

      return (
        matchesSearch &&
        (stockFilter === 'all' || productStockStatus === stockFilter)
      )
    })
  }, [allProducts, search, stockFilter])

  const outOfStockAlerts = useMemo(
    () => alerts.filter((alert) => alert.type === 'out-of-stock'),
    [alerts],
  )
  const delayedOrderAlerts = useMemo(
    () => alerts.filter((alert) => alert.type === 'delayed-order'),
    [alerts],
  )

  const refreshData = useCallback(() => {
    setFeedback(null)
    setReloadNumber((current) => current + 1)
  }, [])

  function requestResolve(alert) {
    setResolveError(null)
    setFeedback(null)
    setSelectedAlert(alert)
  }

  const cancelResolve = useCallback(() => {
    if (!isResolving) {
      setSelectedAlert(null)
      setResolveError(null)
    }
  }, [isResolving])

  async function confirmResolve() {
    if (!selectedAlert || isResolving) {
      return
    }

    setIsResolving(true)
    setResolveError(null)

    try {
      await resolveAlertById(selectedAlert.id)
      setSelectedAlert(null)
      setFeedback({
        type: 'success',
        message: `${selectedAlert.title} marked as resolved.`,
      })
      setReloadNumber((current) => current + 1)
    } catch (error) {
      setResolveError(error.message)
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <section aria-label="Inventory and operational alerts" className="inventory-page">
      <div className="inventory-page-heading">
        <div>
          <h2>Inventory &amp; alerts</h2>
          <p>Monitor stock levels and follow up on operational issues.</p>
        </div>
        <span className="inventory-currency-note">Product prices in BDT</span>
      </div>

      {feedback && (
        <div
          className={`inventory-feedback inventory-feedback-${feedback.type}`}
          ref={feedbackRef}
          role="status"
          tabIndex={-1}
        >
          <CheckCircle2 aria-hidden="true" size={17} />
          <span>{feedback.message}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setFeedback(null)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      )}

      <InventoryTable
        error={productsError}
        isLoading={isLoading}
        onRetry={refreshData}
        onSearchChange={setSearch}
        onStockFilterChange={setStockFilter}
        products={visibleProducts}
        search={search}
        stockFilter={stockFilter}
      />

      <div className="inventory-alert-grid">
        <LowStockProducts
          error={productsError}
          isLoading={isLoading}
          onRetry={refreshData}
          products={allProducts}
        />
        <InventoryAlertList
          alerts={outOfStockAlerts}
          error={alertsError}
          isLoading={isLoading}
          onResolve={requestResolve}
          onRetry={refreshData}
          pendingAlertId={isResolving ? selectedAlert?.id : null}
          title="Out-of-stock alerts"
          description="Products with no sellable units remaining."
        />
      </div>

      <InventoryAlertList
        alerts={delayedOrderAlerts}
        error={alertsError}
        isLoading={isLoading}
        onResolve={requestResolve}
        onRetry={refreshData}
        pendingAlertId={isResolving ? selectedAlert?.id : null}
        title="Delayed order alerts"
        description="Orders that have passed their expected delivery date."
      />

      {selectedAlert && (
        <ConfirmResolveDialog
          alert={selectedAlert}
          error={resolveError}
          isResolving={isResolving}
          onCancel={cancelResolve}
          onConfirm={confirmResolve}
        />
      )}
    </section>
  )
}

export default InventoryPage
