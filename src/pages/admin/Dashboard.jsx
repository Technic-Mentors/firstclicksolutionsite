import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getDashboard } from '../../api/admin/dashboard.api';
import { downloadSalesCsv } from '../../api/admin/reports.api';
import { useAsync } from '../../hooks/useAsync';
import { formatCurrency, formatDateTime } from '../../utils/format';
import StatCard from '../../components/admin/dashboard/StatCard';
import SalesTrendChart from '../../components/admin/dashboard/SalesTrendChart';
import TopList from '../../components/admin/dashboard/TopList';
import OrderStatusCard from '../../components/admin/dashboard/OrderStatusCard';
import QuickActions from '../../components/admin/dashboard/QuickActions';
import DashboardEmpty, {
  WaitingForOrdersArt,
  NoRankingArt,
  AllClearArt,
} from '../../components/admin/dashboard/DashboardEmpty';
import DataTable from '../../components/admin/table/DataTable';
import Badge from '../../components/ui/Badge';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';

const TREND_DAYS = 30;

function isoDaysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const { data, loading, error, refetch } = useAsync(
    () => getDashboard({ trendDays: TREND_DAYS, topLimit: 8 }),
    [],
  );

  async function handleExport() {
    setExporting(true);
    try {
      await downloadSalesCsv({ dateFrom: isoDaysAgo(TREND_DAYS), dateTo: isoDaysAgo(0) });
    } catch {
      toast.error('Could not export the report. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load the dashboard." onRetry={refetch} />;
  }

  const {
    revenue,
    averageOrderValue,
    ordersByStatus,
    pendingCodConfirmation,
    salesTrend,
    topProducts,
    topCategories,
    lowStock,
    newVsReturningCustomers,
    newCustomers,
    recentOrders,
  } = data;

  // The sparklines reuse the trend the page already loaded — each card gets the stretch of it
  // that matches its own headline number, so the shape and the figure agree.
  const trendValues = (salesTrend || []).map((point) => Number(point.revenue) || 0);

  // A change figure needs something to have changed. On a store with no sales every card
  // would otherwise announce a green "+0.0% vs yesterday", which reads as a real flat
  // result rather than as no data at all.
  const changeOf = (period) => (Number(period?.revenue) > 0 ? period?.changePercent : undefined);
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-charcoal-light">{today} · Store overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-stone-50 disabled:opacity-60"
          >
            <DownloadIcon />
            {exporting ? 'Preparing…' : 'Export'}
          </button>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-600"
          >
            <ChartIcon />
            View Sales Report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Revenue today"
          value={formatCurrency(revenue?.today?.revenue)}
          changePercent={changeOf(revenue?.today)}
          comparison="vs yesterday"
          trend={trendValues.slice(-7)}
          icon={<CoinIcon />}
          to="/admin/reports"
          delay={0}
        />
        <StatCard
          label="Revenue this week"
          value={formatCurrency(revenue?.week?.revenue)}
          changePercent={changeOf(revenue?.week)}
          comparison="vs last week"
          trend={trendValues.slice(-14)}
          icon={<CalendarIcon />}
          to="/admin/reports"
          delay={0.05}
        />
        <StatCard
          label="Revenue this month"
          value={formatCurrency(revenue?.month?.revenue)}
          changePercent={changeOf(revenue?.month)}
          comparison="vs last month"
          trend={trendValues}
          icon={<CalendarIcon />}
          to="/admin/reports"
          delay={0.1}
        />
        <StatCard
          label="Avg. order value"
          value={formatCurrency(averageOrderValue)}
          comparison={`across ${revenue?.month?.orderCount ?? 0} orders this month`}
          icon={<CartIcon />}
          to="/admin/reports"
          delay={0.15}
        />
        <StatCard
          label="Pending confirmation"
          value={`${pendingCodConfirmation ?? 0} orders`}
          comparison="waiting on you"
          icon={<BellIcon />}
          highlight
          to="/admin/orders?status=placed"
          delay={0.2}
        />
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="lg:col-span-2">
          <SalesTrendChart data={salesTrend || []} />
        </div>
        <OrderStatusCard counts={ordersByStatus} />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-charcoal">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-medium text-gold-600 hover:text-gold-700">
              View all
            </Link>
          </div>
          {!recentOrders || recentOrders.length === 0 ? (
            <DashboardEmpty
              art={<WaitingForOrdersArt />}
              title="No orders right now"
              description="New orders land here the moment a customer checks out — nothing to do until then."
              actionLabel="Preview the storefront"
              actionTo="/"
            />
          ) : (
          <DataTable
            columns={[
              { key: 'order_number', label: 'Order #' },
              { key: 'customer_name', label: 'Customer' },
              { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
              { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
              { key: 'created_at', label: 'Date', render: (row) => formatDateTime(row.created_at) },
            ]}
            rows={recentOrders}
            onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
          />
          )}
        </div>

        <TopList
          title="Top Products"
          items={(topProducts || []).slice(0, 5)}
          renderLabel={(item) => item.product_name}
          renderValue={(item) => formatCurrency(item.revenue)}
          getAmount={(item) => item.revenue}
          viewAllTo="/admin/products"
          empty={
            <DashboardEmpty
              art={<NoRankingArt />}
              title="Nothing sold yet"
              description="The best sellers of the last 30 days will be ranked here."
            />
          }
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-charcoal">Low Stock</h3>
            {lowStock?.length > 0 && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                {lowStock.length} item{lowStock.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          {!lowStock || lowStock.length === 0 ? (
            <DashboardEmpty
              art={<AllClearArt />}
              title="Stock levels are healthy"
              description="Nothing is running low. Anything that drops below its threshold appears here."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-stone-100">
              {lowStock.slice(0, 5).map((item, idx) => (
                <li key={idx} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-charcoal">{item.product_name}</span>
                    <span className="block truncate text-[11px] text-charcoal-light">
                      {item.stock_quantity} left
                      {item.spec ? ` · ${item.spec}` : ''}
                      {item.condition_grade ? ` · ${item.condition_grade}` : ''}
                    </span>
                  </span>
                  <Link
                    to={item.product_id ? `/admin/products/${item.product_id}/edit` : '/admin/inventory'}
                    className="shrink-0 rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-charcoal transition-colors hover:border-gold-300 hover:bg-gold-50 hover:text-gold-700"
                  >
                    Restock
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <QuickActions />

        <TopList
          title="Top Categories"
          items={(topCategories || []).slice(0, 5)}
          renderLabel={(item) => item.categoryName}
          renderValue={(item) => formatCurrency(item.revenue)}
          getAmount={(item) => item.revenue}
          viewAllTo="/admin/categories"
          empty={
            <DashboardEmpty
              art={<NoRankingArt />}
              title="No category sales yet"
              description="Once orders arrive, your strongest categories show up here."
            />
          }
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <StatCard
          label="New customers this week"
          value={newCustomers?.thisWeek ?? 0}
          icon={<UsersIcon />}
          to="/admin/customers"
        />
        <StatCard
          label="New customers this month"
          value={newCustomers?.thisMonth ?? 0}
          icon={<UsersIcon />}
          to="/admin/customers"
        />
        <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-[13px] font-medium text-charcoal-light">New vs returning (30 days)</h3>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-charcoal-light">New</span>
            <span className="font-semibold text-charcoal">{newVsReturningCustomers?.newCustomers ?? 0}</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between text-sm">
            <span className="text-charcoal-light">Returning</span>
            <span className="font-semibold text-charcoal">{newVsReturningCustomers?.returningCustomers ?? 0}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12M7 11l5 5 5-5M4 21h16" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" /><path d="M7 16v-4M12 16V8M17 16v-7" />
    </svg>
  );
}
function CoinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="12" r="9" /><path d="M14.5 9.5a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.7-2.5 2s1.1 2 2.5 2 2.5.7 2.5 2-1.1 2-2.5 2a2.5 2.5 0 0 1-2.5-1.5M12 6.5v11" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h3l2.6 12.4a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L22 7H6" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" /><path d="M10.5 20a2 2 0 0 0 3 0" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.4a6.5 6.5 0 0 1 3.5 5.6" />
    </svg>
  );
}
