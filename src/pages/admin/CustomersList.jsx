import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCustomers, getCustomerSummary } from '../../api/admin/customers.api';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/format';
import DataTable from '../../components/admin/table/DataTable';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/admin/PageHeader';
import StatTiles from '../../components/admin/StatTiles';
import { UsersIcon, CheckIcon, BoxIcon, BanIcon } from '../../components/admin/tileIcons';
import { NoCustomersArt } from '../../components/ui/emptyArt';
import ActionMenu from '../../components/ui/ActionMenu';
import ErrorState from '../../components/ui/ErrorState';

export default function CustomersList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, error, refetch } = useAsync(
    () => listCustomers({ search: debouncedSearch || undefined, page, pageSize }),
    [debouncedSearch, page, pageSize],
  );

  // Same filter as the list, so the tiles count the customers on screen.
  const { data: summary } = useAsync(
    () => getCustomerSummary({ search: debouncedSearch || undefined }),
    [debouncedSearch],
  );

  const rows = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Customers"
        subtitle="Everyone who has registered an account on your storefront."
        search={{
          value: search,
          onChange: (v) => { setSearch(v); setPage(1); },
          placeholder: 'Search by name, email or phone',
        }}
      />

      {debouncedSearch && (
        <p className="-mb-2 text-xs text-charcoal-light">
          Showing counts for the current filter.{' '}
          <button
            type="button"
            onClick={() => { setSearch(''); setPage(1); }}
            className="font-medium text-gold-600 hover:text-gold-700"
          >
            Clear search
          </button>
        </p>
      )}

      <StatTiles
        tiles={[
          { key: 'total', label: 'Total customers', value: summary?.total, tone: 'primary', icon: <UsersIcon /> },
          { key: 'verified', label: 'Email verified', value: summary?.verified, tone: 'good', icon: <CheckIcon /> },
          { key: 'ordered', label: 'Have ordered', value: summary?.withOrders, tone: 'neutral', icon: <BoxIcon /> },
          { key: 'blocked', label: 'Blocked', value: summary?.blocked, tone: summary?.blocked > 0 ? 'danger' : 'neutral', icon: <BanIcon /> },
        ]}
      />

      {error ? (
        <ErrorState message="Could not load customers." onRetry={refetch} />
      ) : (
        <DataTable
          loading={loading}
          rows={rows}
          onRowClick={(row) => navigate(`/admin/customers/${row.id}`)}
          emptyArt={<NoCustomersArt />}
          emptyTitle="No customers found"
          emptyMessage="Accounts appear here as soon as shoppers register on your storefront."
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone', render: (row) => row.phone || '-' },
            { key: 'order_count', label: 'Orders', render: (row) => row.order_count ?? row.orderCount ?? 0 },
            {
              key: 'lifetime_value',
              label: 'Lifetime Value',
              render: (row) => formatCurrency(row.lifetime_value ?? row.lifetimeValue),
            },
            {
              key: 'is_blocked',
              label: 'Status',
              render: (row) => (
                <Badge status={(row.is_blocked ?? row.isBlocked) ? 'inactive' : 'active'}>
                  {(row.is_blocked ?? row.isBlocked) ? 'Blocked' : 'Active'}
                </Badge>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              actions: true,
              render: (row) => <ActionMenu items={[{ label: 'View customer', to: `/admin/customers/${row.id}` }]} />,
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
                  itemLabel: 'customers',
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
