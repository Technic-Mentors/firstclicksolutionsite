import { getLowStock, getInventorySummary } from '../../api/admin/products.api';
import { useAsync } from '../../hooks/useAsync';
import DataTable from '../../components/admin/table/DataTable';
import ActionMenu from '../../components/ui/ActionMenu';
import PageHeader from '../../components/admin/PageHeader';
import StatTiles from '../../components/admin/StatTiles';
import { LayersIcon, AlertIcon, CrossIcon, BoxIcon } from '../../components/admin/tileIcons';
import { AllClearArt } from '../../components/ui/emptyArt';
import ErrorState from '../../components/ui/ErrorState';
import { cn } from '../../utils/cn';

export default function Inventory() {
  const { data, loading, error, refetch } = useAsync(() => getLowStock(), []);
  // Loaded on its own so a slow list never leaves the counts blank.
  const { data: summary } = useAsync(() => getInventorySummary(), []);

  const rows = data || [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Inventory"
        subtitle="Variants at or below their own low-stock threshold, lowest first."
      />

      <StatTiles
        tiles={[
          { key: 'variants', label: 'Total variants', value: summary?.totalVariants, tone: 'primary', icon: <LayersIcon /> },
          { key: 'units', label: 'Units in stock', value: summary?.unitsInStock, tone: 'neutral', icon: <BoxIcon /> },
          { key: 'low', label: 'Running low', value: summary?.lowStock, tone: summary?.lowStock > 0 ? 'warning' : 'good', icon: <AlertIcon /> },
          { key: 'out', label: 'Out of stock', value: summary?.outOfStock, tone: summary?.outOfStock > 0 ? 'danger' : 'good', icon: <CrossIcon /> },
        ]}
      />

      {error ? (
        <ErrorState message="Could not load inventory." onRetry={refetch} />
      ) : (
        <DataTable
          loading={loading}
          rows={rows}
          emptyArt={<AllClearArt />}
          emptyTitle="Stock levels are healthy"
          emptyMessage="Nothing is running low. Any variant that drops below its threshold shows up here."
          columns={[
            // Widths that add to 100% put the table on table-fixed, so long product names
            // and specs truncate inside their column instead of pushing the row wider than
            // the panel and forcing a sidescroll.
            {
              key: 'product_name',
              label: 'Product',
              primary: true,
              width: '32%',
              render: (row) => (
                <span className="block truncate font-medium text-charcoal" title={row.product_name || row.productName}>
                  {row.product_name || row.productName}
                </span>
              ),
            },
            {
              key: 'spec',
              label: 'Spec',
              width: '25%',
              render: (row) => (
                <span className="block truncate text-charcoal-light" title={row.spec || ''}>
                  {row.spec || '-'}
                </span>
              ),
            },
            {
              key: 'condition_grade',
              label: 'Condition',
              width: '12%',
              render: (row) => row.condition_grade || '-',
            },
            {
              key: 'stock_quantity',
              label: 'Stock',
              width: '10%',
              align: 'right',
              render: (row) => {
                const stock = row.stock_quantity ?? row.stockQuantity ?? 0;
                const threshold = row.low_stock_threshold ?? row.lowStockThreshold;
                return (
                  <span className="flex flex-col items-end leading-tight">
                    <span className={cn('font-semibold', stock <= 0 ? 'text-red-600' : 'text-amber-600')}>
                      {stock}
                    </span>
                    {threshold !== undefined && threshold !== null && (
                      <span className="text-[11px] text-charcoal-light">of {threshold}</span>
                    )}
                  </span>
                );
              },
            },
            {
              key: 'status',
              label: 'Status',
              width: '14%',
              render: (row) => {
                const stock = row.stock_quantity ?? row.stockQuantity ?? 0;
                return stock <= 0 ? (
                  <span className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    Out of stock
                  </span>
                ) : (
                  <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    Running low
                  </span>
                );
              },
            },
            {
              key: 'actions',
              label: 'Actions',
              actions: true,
              width: '7%',
              render: (row) => {
                const productId = row.product_id ?? row.productId;
                return (
                  <ActionMenu
                    items={[
                      productId
                        ? { label: 'Restock', to: `/admin/products/${productId}/edit` }
                        : { label: 'Restock', disabled: true },
                    ]}
                  />
                );
              },
            },
          ]}
        />
      )}
    </div>
  );
}
