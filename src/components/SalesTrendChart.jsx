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

const dateFormatter = new Intl.DateTimeFormat('en-BD', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

function SalesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <p>{dateFormatter.format(new Date(`${label}T00:00:00Z`))}</p>
      <strong>{formatBdt(payload[0].value)}</strong>
    </div>
  )
}

function SalesTrendChart({ data, error, onRetry }) {
  return (
    <ChartCard
      description="Daily revenue from delivered orders"
      error={error}
      isEmpty={!data?.length}
      onRetry={onRetry}
      title="Sales trend"
    >
      <div className="chart-plot">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart
            accessibilityLayer
            aria-label="Daily sales trend"
            data={data}
            margin={{ top: 8, right: 12, bottom: 4, left: 8 }}
          >
            <CartesianGrid stroke="#edf0f5" strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              tickFormatter={(value) => dateFormatter.format(new Date(`${value}T00:00:00Z`))}
              tick={{ fill: '#667085', fontSize: 10 }}
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
            <Tooltip content={<SalesTooltip />} />
            <Line
              activeDot={{ r: 5, strokeWidth: 0 }}
              dataKey="revenue"
              dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
              name="Sales"
              stroke="#31a77b"
              strokeWidth={2.5}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-legend">
        <span aria-hidden="true" className="chart-legend-dot chart-legend-line chart-legend-green" />
        Sales (BDT)
      </p>
    </ChartCard>
  )
}

export default SalesTrendChart
