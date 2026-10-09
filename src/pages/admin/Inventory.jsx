import { useNavigate } from 'react-router-dom';
import { getLowStock } from '../../api/admin/products.api';
import { useAsync } from '../../hooks/useAsync';
import DataTable from '../../components/admin/table/DataTable';
import Button from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import { cn } from '../../utils/cn';

export default function Inventory() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAsync(() => getLowStock(), []);

  const rows = data || [];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-charcoal">Low Stock Inventory</h1>

      {error ? (
        <ErrorState message="Could not load inventory." onRetry={refetch} />
      ) : (
        <DataTable
          loading={loading}
          rows={rows}
          emptyMessage="Nothing is low on stock right now."
          columns={[
            { key: 'product_name', label: 'Product', render: (row) => row.product_name || row.productName },
            { key: 'spec', label: 'Spec', render: (row) => row.spec || '-' },
            { key: 'condition_grade', label: 'Condition', render: (row) => row.condition_grade || '-' },
            {
              key: 'stock_quantity',
              label: 'Current Stock',
              render: (row) => {
                const stock = row.stock_quantity ?? row.stockQuantity ?? 0;
                return (
                  <span
                    className={cn(
                      'font-semibold',
                      stock <= 0 ? 'text-red-600' : 'text-amber-600',
                    )}
                  >
                    {stock}
                  </span>
                );
              },
            },
            {
              key: 'low_stock_threshold',
              label: 'Threshold',
              render: (row) => row.low_stock_threshold ?? row.lowStockThreshold ?? '-',
            },
            {
              key: 'actions',
              label: '',
              render: (row) => {
                const productId = row.product_id ?? row.productId;
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => productId && navigate(`/admin/products/${productId}/edit`)}
                    disabled={!productId}
                  >
                    Restock
                  </Button>
                );
              },
            },
          ]}
        />
      )}
    </div>
  );
}
