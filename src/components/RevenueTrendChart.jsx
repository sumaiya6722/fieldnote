import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatBdt, formatCompactBdt } from '../utils/formatters.js'
import ChartCard from './ChartCard.jsx'

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <p>{label}</p>
      <strong>{formatBdt(payload[0].value)}</strong>
    </div>
  )
}

function RevenueTrendChart({ data, error, onRetry }) {
  return (
    <ChartCard
      description="Delivered-order revenue by month"
      error={error}
      isEmpty={!data?.length}
      onRetry={onRetry}
      title="Revenue trend"
    >
      <div className="chart-plot">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart
            accessibilityLayer
            aria-label="Monthly revenue trend"
            data={data}
            margin={{ top: 8, right: 12, bottom: 4, left: 8 }}
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
              axisLine={false}
              tick={{ fill: '#667085', fontSize: 10 }}
              tickFormatter={formatCompactBdt}
              tickLine={false}
              width={58}
            />
            <Tooltip content={<RevenueTooltip />} />
            <Line
              activeDot={{ r: 5, strokeWidth: 0 }}
              dataKey="revenue"
              dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
              name="Revenue"
              stroke="var(--accent)"
              strokeWidth={2.5}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-legend">
        <span aria-hidden="true" className="chart-legend-dot chart-legend-line" />
        Revenue (BDT)
      </p>
    </ChartCard>
  )
}

export default RevenueTrendChart
