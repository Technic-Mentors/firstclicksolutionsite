import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getSalesReport, downloadSalesCsv } from '../../api/admin/reports.api';
import { listOrders } from '../../api/admin/orders.api';
import { useAsync } from '../../hooks/useAsync';
import { formatCurrency, formatDateTime } from '../../utils/format';
import StatCard from '../../components/admin/dashboard/StatCard';
import SalesTrendChart from '../../components/admin/dashboard/SalesTrendChart';
import TopList from '../../components/admin/dashboard/TopList';
import DataTable from '../../components/admin/table/DataTable';
import Badge from '../../components/ui/Badge';
import { NoResultsArt } from '../../components/ui/emptyArt';
import Input from '../../components/ui/Input';
import SearchableSelect from '../../components/ui/SearchableSelect';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';

function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}

const PRESETS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'This Year', days: 365 },
];

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function Reports() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultTo = useMemo(() => toDateInput(new Date()), []);
  const defaultFrom = useMemo(() => toDateInput(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), []);

  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || defaultFrom);
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || defaultTo);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await downloadSalesCsv({ dateFrom, dateTo, status: status || undefined });
    } catch {
      toast.error('Could not export the report. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  const { data: report, loading, error, refetch } = useAsync(
    () => getSalesReport({ dateFrom, dateTo, topLimit: 8, status: status || undefined }),
    [dateFrom, dateTo, status],
  );

  const { data: ordersData, loading: ordersLoading } = useAsync(
    () => listOrders({ dateFrom, dateTo, status: status || undefined, page, pageSize: 10 }),
    [dateFrom, dateTo, status, page],
  );

  function applyPreset(days) {
    setDateTo(toDateInput(new Date()));
    setDateFrom(toDateInput(new Date(Date.now() - days * 24 * 60 * 60 * 1000)));
    setPage(1);
  }

  const orderRows = ordersData?.data || [];
  const orderMeta = ordersData?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-charcoal">Sales Reports</h1>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
        >
          <DownloadIcon />
          {exporting ? 'Preparing…' : 'Export CSV'}
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white p-4">
        <div className="w-40">
          <Input label="From" type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
        </div>
        <div className="w-40">
          <Input label="To" type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
        </div>
        <div className="w-44">
          <SearchableSelect
            label="Order Status"
            value={status}
            onChange={(val) => { setStatus(val); setPage(1); }}
            options={[
              { value: '', label: 'All statuses' },
              ...STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-2 pb-0.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.days)}
              className="rounded-md border border-stone-300 px-3 py-2 text-xs font-medium text-charcoal-light transition-colors hover:border-gold-400 hover:text-gold-600"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState message="Could not load the sales report." onRetry={refetch} />
      ) : loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <motion.div
          key={`${dateFrom}-${dateTo}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Revenue" value={formatCurrency(report.summary.revenue)} delay={0} />
            <StatCard label="Orders" value={report.summary.orderCount} delay={0.05} />
            <StatCard label="Average Order Value" value={formatCurrency(report.summary.averageOrderValue)} delay={0.1} />
            <StatCard label="Discounts Given" value={formatCurrency(report.summary.totalDiscount)} delay={0.15} />
          </div>

          <SalesTrendChart data={report.trend || []} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopList
              title="Top Products"
              items={report.topProducts || []}
              renderLabel={(item) => item.product_name}
              renderValue={(item) => formatCurrency(item.revenue)}
            />
            <TopList
              title="Top Categories"
              items={report.topCategories || []}
              renderLabel={(item) => item.categoryName}
              renderValue={(item) => formatCurrency(item.revenue)}
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-charcoal">Orders in Range</h3>
            <DataTable
              loading={ordersLoading}
              rows={orderRows}
              emptyArt={<NoResultsArt />}
              emptyTitle="No orders in this range"
              emptyMessage="Try widening the date range or clearing the status filter."
              onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
              columns={[
                { key: 'order_number', label: 'Order #' },
                { key: 'customer_name', label: 'Customer' },
                { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
                { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
                { key: 'created_at', label: 'Date', render: (row) => formatDateTime(row.created_at) },
              ]}
              pagination={
                orderMeta
                  ? {
                      page: orderMeta.page,
                      pageSize: orderMeta.pageSize,
                      total: orderMeta.total,
                      totalPages: orderMeta.totalPages,
                      onPageChange: setPage,
                    }
                  : undefined
              }
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" />
    </svg>
  );
}
