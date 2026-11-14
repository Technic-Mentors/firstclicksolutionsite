import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency, formatDate } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import DashboardEmpty, { NoSalesArt } from './DashboardEmpty';

// Both ranges are cut from the series the dashboard already fetched, so switching is
// instant and costs no request. A 12-month view would need monthly aggregation on the
// backend, which this endpoint does not produce — better absent than faked from daily rows.
const RANGES = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
];

export default function SalesTrendChart({ data = [] }) {
  const [range, setRange] = useState('30d');
  const days = RANGES.find((r) => r.key === range)?.days ?? 30;
  const series = data.slice(-days);

  const total = series.reduce((sum, point) => sum + (Number(point.revenue) || 0), 0);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h3 className="text-sm font-semibold text-charcoal">Sales Trend</h3>
          <span className="text-lg font-semibold text-charcoal">{formatCurrency(total)}</span>
          <span className="text-xs text-charcoal-light">last {days} days</span>
        </div>
        <div className="flex rounded-lg border border-stone-200 p-0.5">
          {RANGES.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRange(option.key)}
              aria-pressed={range === option.key}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                range === option.key
                  ? 'bg-forest-600 text-white'
                  : 'text-charcoal-light hover:bg-stone-100 hover:text-charcoal',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts with no rows still paints axes, which reads as a broken chart rather than
          an empty one — so the empty case replaces the plot entirely, at the same height. */}
      {series.length === 0 ? (
        <div className="flex h-72 w-full items-center justify-center">
          <DashboardEmpty
            art={<NoSalesArt />}
            title="No sales in this period yet"
            description="As soon as an order is placed, the revenue trend starts drawing itself here."
            actionLabel="View products"
            actionTo="/admin/products"
          />
        </div>
      ) : (
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <defs>
              {/* One series, so one hue — brand orange, the colour this admin uses for the
                  thing you act on. No legend: the card title already names the series. */}
              <linearGradient id="salesGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f06c0c" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#f06c0c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0efed" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => formatDate(value)}
              tick={{ fontSize: 11, fill: '#78716c' }}
              axisLine={{ stroke: '#e7e5e4' }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 11, fill: '#78716c' }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              cursor={{ stroke: '#d6d3d1', strokeWidth: 1 }}
              formatter={(value) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label) => formatDate(label)}
              contentStyle={{ borderRadius: 8, borderColor: '#e7e5e4', fontSize: 13 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f06c0c"
              strokeWidth={2}
              fill="url(#salesGold)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
