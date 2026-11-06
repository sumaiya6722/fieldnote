import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ORDER_STATUS_SERIES } from '../utils/overviewCharts.js'
import ChartCard from './ChartCard.jsx'

function OrdersTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <p>{label}</p>
      {payload
        .filter((entry) => entry.value > 0)
        .map((entry) => (
          <div className="chart-tooltip-row" key={entry.dataKey}>
            <span>
              <i style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <strong>{entry.value}</strong>
          </div>
        ))}
    </div>
  )
}

function OrdersOverviewChart({ data, error, onRetry }) {
  return (
    <ChartCard
      description="Order volume by month and status"
      error={error}
      isEmpty={!data?.length}
      onRetry={onRetry}
      title="Orders overview"
    >
      <div className="chart-plot">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            accessibilityLayer
            aria-label="Monthly order counts by status"
            data={data}
            margin={{ top: 8, right: 8, bottom: 4, left: -16 }}
          >
            <CartesianGrid stroke="#edf0f5" strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              tick={{ fill: '#667085', fontSize: 11 }}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tick={{ fill: '#667085', fontSize: 10 }}
              tickLine={false}
              width={42}
            />
            <Tooltip content={<OrdersTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="chart-legend-label">{value}</span>
              )}
              iconSize={8}
              wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
            />
            {ORDER_STATUS_SERIES.map((series) => (
              <Bar
                dataKey={series.key}
                fill={series.color}
                key={series.key}
                name={series.label}
                stackId="orders"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

export default OrdersOverviewChart
