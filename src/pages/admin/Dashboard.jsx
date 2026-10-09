import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDashboard } from '../../api/admin/dashboard.api';
import { useAsync } from '../../hooks/useAsync';
import { formatCurrency, formatDateTime } from '../../utils/format';
import StatCard from '../../components/admin/dashboard/StatCard';
import SalesTrendChart from '../../components/admin/dashboard/SalesTrendChart';
import TopList from '../../components/admin/dashboard/TopList';
import DataTable from '../../components/admin/table/DataTable';
import Badge from '../../components/ui/Badge';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAsync(() => getDashboard({ trendDays: 30, topLimit: 8 }), []);

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
    pendingCodConfirmation,
    salesTrend,
    topProducts,
    topCategories,
    topCoupons,
    lowStock,
    newVsReturningCustomers,
    newCustomers,
    recentOrders,
  } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-charcoal">Dashboard</h1>
        <Link
          to="/admin/reports"
          className="rounded-md bg-gold-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-600"
        >
          View Sales Report
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Revenue Today"
          value={formatCurrency(revenue?.today?.revenue)}
          changePercent={revenue?.today?.changePercent}
          to="/admin/reports"
          delay={0}
        />
        <StatCard
          label="Revenue This Week"
          value={formatCurrency(revenue?.week?.revenue)}
          changePercent={revenue?.week?.changePercent}
          to="/admin/reports"
          delay={0.05}
        />
        <StatCard
          label="Revenue This Month"
          value={formatCurrency(revenue?.month?.revenue)}
          changePercent={revenue?.month?.changePercent}
          to="/admin/reports"
          delay={0.1}
        />
        <StatCard label="Average Order Value" value={formatCurrency(averageOrderValue)} to="/admin/reports" delay={0.15} />
        <StatCard
          label="Pending COD Confirmation"
          value={pendingCodConfirmation ?? 0}
          highlight
          className="ring-1 ring-gold-300"
          to="/admin/orders?status=placed"
          delay={0.2}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <SalesTrendChart data={salesTrend || []} />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TopList
          title="Top Products"
          items={topProducts || []}
          renderLabel={(item) => item.product_name}
          renderValue={(item) => formatCurrency(item.revenue)}
        />
        <TopList
          title="Top Categories"
          items={topCategories || []}
          renderLabel={(item) => item.categoryName}
          renderValue={(item) => formatCurrency(item.revenue)}
        />
        <TopList
          title="Top Coupons"
          items={topCoupons || []}
          renderLabel={(item) => item.code}
          renderValue={(item) => `${item.times_used} uses`}
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="lg:col-span-2 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-charcoal">Low Stock</h3>
            <Link to="/admin/inventory" className="text-xs font-medium text-gold-600 hover:text-gold-700">
              View all
            </Link>
          </div>
          {(!lowStock || lowStock.length === 0) ? (
            <p className="py-6 text-center text-sm text-charcoal-light">Nothing low on stock right now.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-stone-100">
              {lowStock.slice(0, 6).map((item, idx) => (
                <li key={idx} className="flex items-center justify-between py-2.5 text-sm">
                  <Link
                    to={item.product_id ? `/admin/products/${item.product_id}/edit` : '/admin/inventory'}
                    className="text-charcoal hover:text-gold-600"
                  >
                    {item.product_name} {item.spec ? `(${item.spec}${item.condition_grade ? ` / ${item.condition_grade}` : ''})` : ''}
                  </Link>
                  <span className="font-medium text-red-600">{item.stock_quantity} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <StatCard label="New Customers This Week" value={newCustomers?.thisWeek ?? 0} to="/admin/customers" />
          <StatCard label="New Customers This Month" value={newCustomers?.thisMonth ?? 0} to="/admin/customers" />
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-charcoal">New vs Returning</h3>
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-light">New</span>
              <span className="font-semibold text-charcoal">{newVsReturningCustomers?.newCustomers ?? 0}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-charcoal-light">Returning</span>
              <span className="font-semibold text-charcoal">{newVsReturningCustomers?.returningCustomers ?? 0}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-charcoal">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs font-medium text-gold-600 hover:text-gold-700">
            View all
          </Link>
        </div>
        <DataTable
          columns={[
            { key: 'order_number', label: 'Order #' },
            { key: 'customer_name', label: 'Customer' },
            { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
            { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
            { key: 'created_at', label: 'Date', render: (row) => formatDateTime(row.created_at) },
          ]}
          rows={recentOrders || []}
          emptyMessage="No orders yet."
          onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
        />
      </motion.div>
    </div>
  );
}
