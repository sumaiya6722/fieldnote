import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import ChartCard from './ChartCard.jsx'

const STATUS_COLORS = {
  Pending: '#e6a23c',
  Processing: '#5684e8',
  Shipped: '#8a6bd6',
  Delivered: '#31a77b',
  Cancelled: '#e36c6c',
}

function StatusTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const { name, value } = payload[0]
  return (
    <div className="chart-tooltip">
      <p>{name}</p>
      <strong>
        {value} {value === 1 ? 'order' : 'orders'}
      </strong>
    </div>
  )
}

function OrderStatusDistributionChart({ data, error, onRetry }) {
  const visibleData = data?.filter((item) => item.count > 0) ?? []
  const hasOrders = visibleData.length > 0

  return (
    <ChartCard
      description="Order counts grouped by current status"
      error={error}
      isEmpty={!hasOrders}
      onRetry={onRetry}
      title="Order status distribution"
    >
      <div className="chart-plot">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer aria-label="Order status distribution">
            <Pie
              data={visibleData}
              dataKey="count"
              innerRadius="52%"
              nameKey="status"
              outerRadius="78%"
              paddingAngle={3}
              stroke="none"
            >
              {visibleData.map((item) => (
                <Cell
                  fill={STATUS_COLORS[item.status] ?? '#667085'}
                  key={item.status}
                />
              ))}
            </Pie>
            <Tooltip content={<StatusTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="chart-legend-label">{value}</span>
              )}
              iconSize={8}
              wrapperStyle={{ fontSize: 10 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

export default OrderStatusDistributionChart
