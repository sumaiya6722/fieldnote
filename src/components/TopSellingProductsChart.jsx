import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatBdt } from '../utils/formatters.js'
import ChartCard from './ChartCard.jsx'

function ProductTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const product = payload[0].payload
  return (
    <div className="chart-tooltip">
      <p>{product.name}</p>
      <div className="chart-tooltip-row">
        <span>Units sold</span>
        <strong>{product.unitsSold}</strong>
      </div>
      <div className="chart-tooltip-row">
        <span>Item revenue</span>
        <strong>{formatBdt(product.revenue)}</strong>
      </div>
    </div>
  )
}

function TopSellingProductsChart({ data, error, onRetry }) {
  return (
    <ChartCard
      description="Units sold, excluding cancelled orders"
      error={error}
      isEmpty={!data?.length}
      onRetry={onRetry}
      title="Top-selling products"
    >
      <div className="chart-plot product-chart-plot">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            accessibilityLayer
            aria-label="Top-selling products by units sold"
            data={data}
            layout="vertical"
            margin={{ top: 2, right: 20, bottom: 2, left: 0 }}
          >
            <CartesianGrid stroke="#edf0f5" strokeDasharray="3 3" horizontal={false} />
            <XAxis
              allowDecimals={false}
              axisLine={false}
              tick={{ fill: '#667085', fontSize: 10 }}
              tickLine={false}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="name"
              tick={{ fill: '#697489', fontSize: 10 }}
              tickLine={false}
              type="category"
              width={118}
            />
            <Tooltip content={<ProductTooltip />} />
            <Bar
              dataKey="unitsSold"
              name="Units sold"
              radius={[0, 4, 4, 0]}
            >
              {data.map((product, index) => (
                <Cell
                  fill={index === 0 ? 'var(--accent)' : '#93abe0'}
                  key={product.productId}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

export default TopSellingProductsChart
