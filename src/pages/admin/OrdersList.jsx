import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listOrders, getOrderSummary } from '../../api/admin/orders.api';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatDateTime } from '../../utils/format';
import DataTable from '../../components/admin/table/DataTable';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/admin/PageHeader';
import StatTiles from '../../components/admin/StatTiles';
import { ListIcon, ClockIcon, TruckIcon, CheckIcon, CrossIcon } from '../../components/admin/tileIcons';
import { WaitingForOrdersArt } from '../../components/ui/emptyArt';
import ActionMenu from '../../components/ui/ActionMenu';
import Input from '../../components/ui/Input';
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
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, error, refetch } = useAsync(
    () =>
      listOrders({
        status: status || undefined,
        search: debouncedSearch || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        pageSize: 10,
      }),
    [status, debouncedSearch, dateFrom, dateTo, page],
  );

  const { data: summary } = useAsync(() => getOrderSummary(), []);

  const rows = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Orders"
        subtitle="Every order placed on the storefront, and where each one has got to."
      />

      <StatTiles
        tiles={[
          { key: 'total', label: 'Total orders', value: summary?.total, tone: 'primary', icon: <ListIcon /> },
          { key: 'awaiting', label: 'Awaiting confirmation', value: summary?.awaiting, tone: summary?.awaiting > 0 ? 'warning' : 'neutral', icon: <ClockIcon /> },
          { key: 'progress', label: 'In progress', value: summary?.inProgress, tone: 'neutral', icon: <TruckIcon /> },
          { key: 'delivered', label: 'Delivered', value: summary?.delivered, tone: 'good', icon: <CheckIcon /> },
          { key: 'stopped', label: 'Cancelled / returned', value: summary?.stopped, tone: 'neutral', icon: <CrossIcon /> },
        ]}
      />

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white p-4">
        <div className="w-52">
          <Input
            label="Search"
            placeholder="Order # or customer"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-44">
          <SearchableSelect
            label="Status"
            value={status}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All statuses' },
              ...STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
            ]}
          />
        </div>
        <div className="w-40">
          <Input
            label="From"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-40">
          <Input
            label="To"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

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
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
