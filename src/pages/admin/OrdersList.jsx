import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listOrders, getOrderSummary } from '../../api/admin/orders.api';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatDateTime } from '../../utils/format';
import DataTable from '../../components/admin/table/DataTable';
import Badge from '../../components/ui/Badge';
import FilterBar from '../../components/admin/FilterBar';
import PageHeader from '../../components/admin/PageHeader';
import StatTiles from '../../components/admin/StatTiles';
import { ListIcon, ClockIcon, TruckIcon, CheckIcon, CrossIcon } from '../../components/admin/tileIcons';
import { WaitingForOrdersArt } from '../../components/ui/emptyArt';
import ActionMenu from '../../components/ui/ActionMenu';
import SearchableSelect from '../../components/ui/SearchableSelect';
import ErrorState from '../../components/ui/ErrorState';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function OrdersList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search, 400);
  const isFiltered = Boolean(debouncedSearch || status || dateFrom || dateTo);

  const { data, loading, error, refetch } = useAsync(
    () =>
      listOrders({
        status: status || undefined,
        search: debouncedSearch || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        pageSize,
      }),
    [status, debouncedSearch, dateFrom, dateTo, page, pageSize],
  );

  // Same filters as the list, so the tiles count the orders on screen.
  const { data: summary } = useAsync(
    () =>
      getOrderSummary({
        status: status || undefined,
        search: debouncedSearch || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
    [status, debouncedSearch, dateFrom, dateTo],
  );

  const rows = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Orders"
        subtitle="Every order placed on the storefront, and where each one has got to."
        search={{
          value: search,
          onChange: (v) => { setSearch(v); setPage(1); },
          placeholder: 'Search by order number or customer',
        }}
      />

      {isFiltered && (
        <p className="-mb-2 text-xs text-charcoal-light">
          Showing counts for the current filter.{' '}
          <button
            type="button"
            onClick={() => { setSearch(''); setStatus(''); setDateFrom(''); setDateTo(''); setPage(1); }}
            className="font-medium text-gold-600 hover:text-gold-700"
          >
            Clear filters
          </button>
        </p>
      )}

      <StatTiles
        tiles={[
          { key: 'total', label: 'Total orders', value: summary?.total, tone: 'primary', icon: <ListIcon /> },
          { key: 'awaiting', label: 'Awaiting confirmation', value: summary?.awaiting, tone: summary?.awaiting > 0 ? 'warning' : 'neutral', icon: <ClockIcon /> },
          { key: 'progress', label: 'In progress', value: summary?.inProgress, tone: 'neutral', icon: <TruckIcon /> },
          { key: 'delivered', label: 'Delivered', value: summary?.delivered, tone: 'good', icon: <CheckIcon /> },
          { key: 'stopped', label: 'Cancelled / returned', value: summary?.stopped, tone: 'neutral', icon: <CrossIcon /> },
        ]}
      />

      <FilterBar
        trailing={
          <>
            <div className="w-44">
              <SearchableSelect
                value={status}
                onChange={(val) => { setStatus(val); setPage(1); }}
                options={[
                  { value: '', label: 'All statuses' },
                  ...STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
                ]}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-charcoal-light">
              <span>From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="h-10 rounded-lg border border-stone-300 px-3 text-sm text-charcoal focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-charcoal-light">
              <span>To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="h-10 rounded-lg border border-stone-300 px-3 text-sm text-charcoal focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
            </label>
          </>
        }
      />

      {error ? (
        <ErrorState message="Could not load orders." onRetry={refetch} />
      ) : (
        <DataTable
          loading={loading}
          rows={rows}
          onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
          emptyArt={<WaitingForOrdersArt />}
          emptyTitle="No orders to show"
          emptyMessage="Either nothing has been ordered yet, or no order matches the filters above."
          columns={[
            { key: 'order_number', label: 'Order #' },
            { key: 'customer_name', label: 'Customer' },
            { key: 'customer_email', label: 'Email' },
            { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
            { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
            { key: 'created_at', label: 'Placed', render: (row) => formatDateTime(row.created_at) },
            {
              key: 'actions',
              label: 'Actions',
              actions: true,
              render: (row) => <ActionMenu items={[{ label: 'View order', to: `/admin/orders/${row.id}` }]} />,
            },
          ]}
          pagination={
            meta
              ? {
                  page: meta.page,
                  pageSize: meta.pageSize,
                  total: meta.total,
                  totalPages: meta.totalPages,
                  onPageChange: setPage,
                  onPageSizeChange: (size) => { setPageSize(size); setPage(1); },
                  itemLabel: 'orders',
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
