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
import {
  formatBdt,
  formatCompactBdt,
  formatMonthPeriod,
} from '../utils/formatters.js'
import ChartCard from './ChartCard.jsx'

function RevenueComparisonTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <p>{formatMonthPeriod(label)}</p>
      {payload.map((entry) => (
        <div className="chart-tooltip-row" key={entry.dataKey}>
          <span>
            <i style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
          <strong>{formatBdt(entry.value)}</strong>
        </div>
      ))}
    </div>
  )
}

function MonthlyRevenueComparisonChart({ data, error, onRetry }) {
  const hasRevenue = data?.some(
    (month) => month.revenue > 0 || month.previousMonthRevenue > 0,
  )

  return (
    <ChartCard
      description="Delivered revenue compared with the previous month"
      error={error}
      isEmpty={!hasRevenue}
      onRetry={onRetry}
      title="Monthly revenue comparison"
    >
      <div className="chart-plot">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            accessibilityLayer
            aria-label="Monthly revenue compared with previous month"
            data={data}
            margin={{ top: 8, right: 12, bottom: 4, left: 8 }}
          >
            <CartesianGrid stroke="#edf0f5" strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={formatMonthPeriod}
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
            <Tooltip content={<RevenueComparisonTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="chart-legend-label">{value}</span>
              )}
              iconSize={8}
              wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
            />
            <Bar
              dataKey="revenue"
              fill="var(--accent)"
              name="Selected period"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="previousMonthRevenue"
              fill="#b9c9ed"
              name="Previous month"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

export default MonthlyRevenueComparisonChart
