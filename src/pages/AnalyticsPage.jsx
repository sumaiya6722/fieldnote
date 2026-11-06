import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AlertCircle, CalendarDays } from 'lucide-react'
import AnalyticsPerformanceSummary from '../components/AnalyticsPerformanceSummary.jsx'
import { getAnalytics } from '../services/analyticsService.js'
import { validateAnalyticsDateRange } from '../utils/analyticsCalculations.js'
import './AnalyticsPage.css'

const MonthlyRevenueComparisonChart = lazy(
  () => import('../components/MonthlyRevenueComparisonChart.jsx'),
)
const SalesTrendChart = lazy(() => import('../components/SalesTrendChart.jsx'))
const OrderStatusDistributionChart = lazy(
  () => import('../components/OrderStatusDistributionChart.jsx'),
)
const TopSellingProductsChart = lazy(
  () => import('../components/TopSellingProductsChart.jsx'),
)

function AnalyticsPage() {
  const [draftRange, setDraftRange] = useState({ startDate: '', endDate: '' })
  const [appliedRange, setAppliedRange] = useState({
    startDate: '',
    endDate: '',
  })
  const [dateError, setDateError] = useState(null)
  const [requestNumber, setRequestNumber] = useState(0)
  const [requestState, setRequestState] = useState(null)
  const requestSequence = useRef(0)

  const queryKey = JSON.stringify(appliedRange)
  const queryOptions = appliedRange

  useEffect(() => {
    const currentSequence = ++requestSequence.current

    getAnalytics(queryOptions)
      .then((response) => {
        if (currentSequence === requestSequence.current) {
          setRequestState({
            queryKey,
            requestNumber,
            status: 'success',
            report: response.data,
          })
        }
      })
      .catch((error) => {
        if (currentSequence === requestSequence.current) {
          setRequestState({ queryKey, requestNumber, status: 'error', error })
        }
      })

    return () => {
      requestSequence.current += 1
    }
  }, [queryKey, queryOptions, requestNumber])

  const currentRequest =
    requestState?.queryKey === queryKey &&
    requestState?.requestNumber === requestNumber
      ? requestState
      : null
  const isLoading = currentRequest === null
  const report =
    currentRequest?.status === 'success' ? currentRequest.report : null
  const requestError =
    currentRequest?.status === 'error' ? currentRequest.error : null

  function updateDate(event) {
    const { name, value } = event.target
    setDraftRange((current) => ({ ...current, [name]: value }))
    setDateError(null)
  }

  function applyDateRange(event) {
    event.preventDefault()
    const validationError = validateAnalyticsDateRange(draftRange)

    if (validationError) {
      setDateError(validationError)
      return
    }

    setDateError(null)
    setAppliedRange({ ...draftRange })
  }

  function clearDateRange() {
    setDateError(null)
    setDraftRange({ startDate: '', endDate: '' })
    setAppliedRange({ startDate: '', endDate: '' })
  }

  function retryRequest() {
    setRequestNumber((number) => number + 1)
  }

  const chartFallback = (
    <div className="overview-panel analytics-chart-loading" role="status">
      Loading chart…
    </div>
  )

  return (
    <section aria-label="Sales analytics" className="analytics-page">
      <div className="analytics-page-heading">
        <div>
          <h2>Sales analytics</h2>
          <p>Explore sales and order performance across a selected period.</p>
        </div>
      </div>

      <form
        className="analytics-filter-panel"
        noValidate
        onSubmit={applyDateRange}
      >
        <fieldset
          className="analytics-date-fieldset"
        >
          <legend>
            <CalendarDays aria-hidden="true" size={15} />
            Analytics date range
          </legend>
          <label>
            <span>From</span>
            <input
              aria-invalid={dateError?.field === 'startDate'}
              aria-label="Analytics start date"
              aria-describedby={dateError?.field === 'startDate' ? 'analytics-date-error' : undefined}
              name="startDate"
              onChange={updateDate}
              type="date"
              value={draftRange.startDate}
            />
          </label>
          <span aria-hidden="true" className="analytics-date-divider">
            to
          </span>
          <label>
            <span>To</span>
            <input
              aria-invalid={dateError?.field === 'endDate'}
              aria-label="Analytics end date"
              aria-describedby={dateError?.field === 'endDate' ? 'analytics-date-error' : undefined}
              name="endDate"
              onChange={updateDate}
              type="date"
              value={draftRange.endDate}
            />
          </label>
          <div className="analytics-filter-actions">
            <button className="analytics-apply-button" type="submit">
              Apply range
            </button>
            <button
              className="analytics-clear-button"
              onClick={clearDateRange}
              type="button"
            >
              Clear
            </button>
          </div>
        </fieldset>
        {dateError && (
          <p className="analytics-date-error" id="analytics-date-error" role="alert">
            <AlertCircle aria-hidden="true" size={15} />
            {dateError.message}
          </p>
        )}
      </form>

      {isLoading ? (
        <div aria-busy="true" className="analytics-loading">
          <p role="status">Loading analytics…</p>
          <div className="analytics-summary-grid" aria-hidden="true">
            {['one', 'two', 'three', 'four'].map((key) => (
              <div className="analytics-summary-skeleton" key={key} />
            ))}
          </div>
          <div className="analytics-chart-grid" aria-hidden="true">
            {['one', 'two', 'three', 'four'].map((key) => (
              <div className="analytics-chart-skeleton" key={key} />
            ))}
          </div>
        </div>
      ) : requestError ? (
        <section className="analytics-error-state" role="alert">
          <AlertCircle aria-hidden="true" size={20} />
          <div>
            <h2>Analytics couldn’t be loaded</h2>
            <p>{requestError.message}</p>
          </div>
          <button onClick={retryRequest} type="button">
            Try again
          </button>
        </section>
      ) : report ? (
        <>
          <div className="analytics-period-note">
            Showing {report.period.startDate || 'no start date'} –{' '}
            {report.period.endDate || 'no end date'} · BDT
          </div>

          <AnalyticsPerformanceSummary
            previousPeriod={report.previousPeriod}
            summary={report.summary}
          />

          <div className="analytics-chart-grid">
            <Suspense fallback={chartFallback}>
              <MonthlyRevenueComparisonChart
                data={report.monthlySales}
                error={null}
                onRetry={retryRequest}
              />
            </Suspense>
            <Suspense fallback={chartFallback}>
              <SalesTrendChart
                data={report.salesTrend}
                error={null}
                onRetry={retryRequest}
              />
            </Suspense>
            <Suspense fallback={chartFallback}>
              <OrderStatusDistributionChart
                data={report.orderStatusDistribution}
                error={null}
                onRetry={retryRequest}
              />
            </Suspense>
            <Suspense fallback={chartFallback}>
              <TopSellingProductsChart
                data={report.topSellingProducts}
                error={null}
                onRetry={retryRequest}
              />
            </Suspense>
          </div>
        </>
      ) : (
        <p className="analytics-empty-state" role="status">
          Analytics are unavailable.
        </p>
      )}
    </section>
  )
}

export default AnalyticsPage
