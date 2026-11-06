import { lazy, Suspense, useEffect, useState } from 'react'
import {
  CircleAlert,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ShoppingCart,
} from 'lucide-react'
import KpiCard from '../components/KpiCard.jsx'
import OperationalAlertsPreview from '../components/OperationalAlertsPreview.jsx'
import RecentOrdersTable from '../components/RecentOrdersTable.jsx'
import { getAlerts } from '../services/alertsService.js'
import { getAnalytics } from '../services/analyticsService.js'
import { getOrders } from '../services/ordersService.js'
import { calculateDashboardKpis } from '../utils/dashboardKpis.js'
import {
  prepareOrdersOverviewData,
  prepareRevenueTrendData,
} from '../utils/overviewCharts.js'
import './OverviewPage.css'

const OrdersOverviewChart = lazy(
  () => import('../components/OrdersOverviewChart.jsx'),
)
const RevenueTrendChart = lazy(
  () => import('../components/RevenueTrendChart.jsx'),
)

const iconsByKpi = {
  revenue: CircleDollarSign,
  orders: ShoppingCart,
  pending: Clock3,
  delivered: PackageCheck,
}

function OverviewPage() {
  const [requestNumber, setRequestNumber] = useState(0)
  const [requestState, setRequestState] = useState(null)

  useEffect(() => {
    let isCurrentRequest = true

    Promise.allSettled([
      getOrders({ page: 1, pageSize: 100 }),
      getAnalytics(),
      getAlerts({ page: 1, pageSize: 4 }),
    ]).then(([ordersResult, analyticsResult, alertsResult]) => {
      if (!isCurrentRequest) {
        return
      }

      setRequestState({
        requestNumber,
        orders:
          ordersResult.status === 'fulfilled' ? ordersResult.value.data : [],
        ordersError:
          ordersResult.status === 'rejected' ? ordersResult.reason : null,
        analytics:
          analyticsResult.status === 'fulfilled'
            ? analyticsResult.value.data
            : null,
        analyticsError:
          analyticsResult.status === 'rejected'
            ? analyticsResult.reason
            : null,
        alerts:
          alertsResult.status === 'fulfilled' ? alertsResult.value.data : [],
        alertsError:
          alertsResult.status === 'rejected' ? alertsResult.reason : null,
      })
    })

    return () => {
      isCurrentRequest = false
    }
  }, [requestNumber])

  const currentRequest =
    requestState?.requestNumber === requestNumber ? requestState : null
  const isLoading = currentRequest === null
  const orders = currentRequest?.orders ?? []
  const ordersError = currentRequest?.ordersError ?? null
  const analytics = currentRequest?.analytics
  const analyticsError = currentRequest?.analyticsError ?? null
  const alerts = currentRequest?.alerts ?? []
  const alertsError = currentRequest?.alertsError ?? null

  if (isLoading) {
    return (
      <section
        aria-busy="true"
        aria-label="Loading overview dashboard"
        className="overview-section"
      >
        <div className="overview-heading">
          <h2>Store performance</h2>
          <p>All available order history</p>
        </div>
        <div className="kpi-grid">
          {['revenue', 'orders', 'pending', 'delivered'].map((key) => (
            <div aria-hidden="true" className="kpi-skeleton" key={key}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="dashboard-widget-skeletons">
          <div className="widget-skeleton" />
          <div className="widget-skeleton" />
          <div className="widget-skeleton widget-skeleton-wide" />
          <div className="widget-skeleton" />
        </div>
        <p className="overview-status" role="status">
          Loading dashboard data…
        </p>
      </section>
    )
  }

  const kpis = orders.length ? calculateDashboardKpis(orders) : []
  const revenueData = prepareRevenueTrendData(analytics?.monthlySales)
  const ordersData = prepareOrdersOverviewData(orders)
  const recentOrders = orders.slice(0, 5)
  const retryRequests = () => setRequestNumber((number) => number + 1)

  return (
    <section className="overview-section">
      <div className="overview-heading">
        <div>
          <h2>Store performance</h2>
          <p>All available order history · monthly change compares the latest two months</p>
        </div>
      </div>

      {ordersError ? (
        <div className="overview-inline-error" role="alert">
          <CircleAlert aria-hidden="true" size={18} />
          <span>Order metrics are unavailable: {ordersError.message}</span>
          <button onClick={retryRequests} type="button">
            Retry
          </button>
        </div>
      ) : kpis.length ? (
        <div className="kpi-grid">
          {kpis.map((kpi) => (
            <KpiCard
              comparison={kpi.comparison}
              format={kpi.format}
              Icon={iconsByKpi[kpi.id]}
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
            />
          ))}
        </div>
      ) : (
        <div className="overview-inline-empty" role="status">
          No order data is available to calculate dashboard metrics.
        </div>
      )}

      <div className="overview-chart-grid">
        <Suspense
          fallback={
            <div className="overview-panel chart-loading" role="status">
              Loading revenue chart…
            </div>
          }
        >
          <RevenueTrendChart
            data={revenueData}
            error={analyticsError}
            onRetry={retryRequests}
          />
        </Suspense>
        <Suspense
          fallback={
            <div className="overview-panel chart-loading" role="status">
              Loading orders chart…
            </div>
          }
        >
          <OrdersOverviewChart
            data={ordersData}
            error={ordersError}
            onRetry={retryRequests}
          />
        </Suspense>
      </div>

      <div className="overview-detail-grid">
        <RecentOrdersTable
          error={ordersError}
          onRetry={retryRequests}
          orders={recentOrders}
        />
        <OperationalAlertsPreview
          alerts={alerts}
          error={alertsError}
          onRetry={retryRequests}
        />
      </div>
    </section>
  )
}

export default OverviewPage
