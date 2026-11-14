import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  listProducts,
  deleteProduct,
  getProductSummary,
  setProductFeatured,
} from '../../api/admin/products.api';
import { listCategories } from '../../api/admin/categories.api';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/format';
import { cn } from '../../utils/cn';
import DataTable from '../../components/admin/table/DataTable';
import PageHeader from '../../components/admin/PageHeader';
import StatTiles from '../../components/admin/StatTiles';
import FilterBar, { FilterChip } from '../../components/admin/FilterBar';
import Badge from '../../components/ui/Badge';
import { NoProductsArt } from '../../components/ui/emptyArt';
import ActionMenu from '../../components/ui/ActionMenu';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorState from '../../components/ui/ErrorState';
import { getErrorMessage } from '../../utils/errorMessage';
import { assetUrl } from '../../utils/media';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'price_asc', label: 'Price low to high' },
  { value: 'price_desc', label: 'Price high to low' },
];

/**
 * Stock health shown on the row.
 *
 * The list endpoint returns a product's total stock but not each variant's own
 * `low_stock_threshold`, so these bands are a display heuristic, not the same rule the
 * Inventory page and the low-stock badge use (those read the real per-variant threshold).
 * They agree on the only case that really matters — zero is out of stock.
 */
function stockHealth(quantity) {
  if (quantity <= 0) return { label: 'Out of stock', color: '#dc2626', fill: 0 };
  if (quantity <= 3) return { label: 'Critical', color: '#dc2626', fill: quantity / 25 };
  if (quantity <= 10) return { label: 'Low', color: '#ca8a04', fill: quantity / 25 };
  return { label: 'In stock', color: '#15803d', fill: Math.min(quantity / 25, 1) };
}

export default function ProductsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // The list comes from useAsync, which owns its data, so the toggle keeps its own overlay
  // of ids it has changed. That lets the star flip the instant it is pressed instead of
  // waiting for a round trip, and lets it flip back if the server refuses.
  const [featuredOverride, setFeaturedOverride] = useState({});
  const [featuredBusy, setFeaturedBusy] = useState({});
  const debouncedSearch = useDebounce(search, 400);

  const { data: categories } = useAsync(() => listCategories(), []);
  const { data: summary, refetch: refetchSummary } = useAsync(() => getProductSummary(), []);
  const { data, loading, error, refetch } = useAsync(
    () =>
      listProducts({
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
        sort,
        page,
        pageSize: 10,
      }),
    [debouncedSearch, categoryId, sort, page],
  );

  const rows = data?.data || [];
  const meta = data?.meta;

  // A new filter or page brings rows straight from the server, so the local overlay has
  // nothing left to correct — keeping it would let a stale flip mask the real value.
  useEffect(() => {
    setFeaturedOverride({});
  }, [debouncedSearch, categoryId, sort, page]);

  function applyFilter(next) {
    next();
    setPage(1);
  }

  function isFeatured(row) {
    return featuredOverride[row.id] ?? Boolean(row.is_featured);
  }

  async function toggleFeatured(row) {
    const next = !isFeatured(row);
    setFeaturedOverride((current) => ({ ...current, [row.id]: next }));
    setFeaturedBusy((current) => ({ ...current, [row.id]: true }));
    try {
      await setProductFeatured(row.id, next);
      // Only the tile count needs re-reading; re-fetching the list would reorder rows under
      // the cursor for no benefit.
      refetchSummary();
    } catch (err) {
      setFeaturedOverride((current) => {
        const reverted = { ...current };
        delete reverted[row.id];
        return reverted;
      });
      toast.error(getErrorMessage(err, 'Could not update this product.'));
    } finally {
      setFeaturedBusy((current) => ({ ...current, [row.id]: false }));
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Product deleted.');
      setDeleteTarget(null);
      refetch();
      refetchSummary();
    } catch (err) {
      const message = getErrorMessage(err, 'Something went wrong');
      toast.error(
        err.response?.status === 409
          ? `${message} This product cannot be deleted because it has existing orders. Try marking it inactive instead.`
          : message,
      );
    } finally {
      setDeleting(false);
    }
  }

  const tiles = [
    { key: 'total', label: 'Total products', value: summary?.total, icon: <BoxIcon />, tone: 'primary' },
    { key: 'active', label: 'Active on store', value: summary?.active, icon: <CheckIcon />, tone: 'good' },
    { key: 'featured', label: 'Featured', value: summary?.featured, icon: <StarIcon />, tone: 'accent' },
    { key: 'low', label: 'Low stock', value: summary?.lowStock, icon: <AlertIcon />, tone: 'warning' },
    { key: 'out', label: 'Out of stock', value: summary?.outOfStock, icon: <CrossIcon />, tone: 'danger' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Products"
        subtitle="Manage your catalogue, pricing, stock and what's featured on the storefront."
        actions={
          <Button variant="gold" onClick={() => navigate('/admin/products/new')}>
            Add Product
          </Button>
        }
      />

      <StatTiles tiles={tiles} />

      <FilterBar
        search={{ value: search, onChange: (v) => applyFilter(() => setSearch(v)), placeholder: 'Search by name' }}
        chips={
          <>
            <FilterChip active={categoryId === ''} onClick={() => applyFilter(() => setCategoryId(''))}>
              All categories
            </FilterChip>
            {(categories || []).map((category) => (
              <FilterChip
                key={category.id}
                active={String(categoryId) === String(category.id)}
                onClick={() => applyFilter(() => setCategoryId(category.id))}
              >
                {category.name}
              </FilterChip>
            ))}
          </>
        }
        trailing={
          <label className="flex shrink-0 items-center gap-2 text-sm text-charcoal-light">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => applyFilter(() => setSort(e.target.value))}
              aria-label="Sort products"
              className="rounded-lg border border-stone-300 py-2 pl-3 pr-8 text-sm text-charcoal focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        }
      />

      {error ? (
        <ErrorState message="Could not load products." onRetry={refetch} />
      ) : (
        <DataTable
          loading={loading}
          rows={rows}
          onRowClick={(row) => navigate(`/admin/products/${row.id}/edit`)}
          emptyArt={<NoProductsArt />}
          emptyTitle="No products found"
          emptyMessage="Add your first product, or clear the filters above if you were searching."
          columns={[
            {
              key: 'name',
              label: 'Product',
              primary: true,
              // The widths add up to 100%, so the row always fits the panel instead of
              // pushing it into a sidescroll.
              width: '34%',
              render: (row) => (
                <div className="flex min-w-0 items-center gap-3">
                  {row.primary_image ? (
                    <img
                      src={assetUrl(row.primary_image)}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-md border border-stone-200 object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 shrink-0 rounded-md border border-stone-200 bg-stone-100" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-charcoal">{row.name}</span>
                    <span className="block truncate text-[11px] text-charcoal-light">{row.slug}</span>
                  </span>
                </div>
              ),
            },
            {
              key: 'category_name',
              label: 'Category',
              width: '15%',
              render: (row) => (
                <span className="inline-block max-w-full truncate rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-charcoal-light">
                  {row.category_name}
                </span>
              ),
            },
            {
              key: 'base_price',
              label: 'Price',
              width: '10%',
              align: 'right',
              render: (row) => (
                <span className="font-medium">{formatCurrency(row.base_price ?? row.basePrice)}</span>
              ),
            },
            {
              key: 'total_stock',
              label: 'Stock',
              width: '16%',
              render: (row) => {
                const quantity = Number(row.total_stock ?? row.totalStock ?? 0);
                const health = stockHealth(quantity);
                return (
                  <span className="block">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-charcoal">{quantity}</span>
                      <span className="text-[11px]" style={{ color: health.color }}>
                        {health.label}
                      </span>
                    </span>
                    <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-stone-100">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${Math.max(health.fill * 100, quantity > 0 ? 6 : 0)}%`, backgroundColor: health.color }}
                      />
                    </span>
                  </span>
                );
              },
            },
            {
              key: 'is_active',
              label: 'Status',
              width: '11%',
              render: (row) => <Badge status={row.is_active ? 'active' : 'draft'}>{row.is_active ? 'Active' : 'Draft'}</Badge>,
            },
            {
              key: 'is_featured',
              label: 'Featured',
              width: '9%',
              render: (row) => {
                const featured = isFeatured(row);
                return (
                  <button
                    type="button"
                    // The row navigates to the edit form, so the star has to keep its click.
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFeatured(row);
                    }}
                    disabled={featuredBusy[row.id]}
                    aria-pressed={featured}
                    title={featured ? 'Featured — click to remove' : 'Not featured — click to feature'}
                    className={cn(
                      'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                      featured ? 'text-gold-500 hover:bg-gold-50' : 'text-stone-300 hover:bg-stone-100 hover:text-stone-400',
                      featuredBusy[row.id] && 'opacity-50',
                    )}
                  >
                    <StarIcon filled={featured} />
                    <span className="sr-only">
                      {featured ? `Remove ${row.name} from featured` : `Feature ${row.name}`}
                    </span>
                  </button>
                );
              },
            },
            {
              key: 'actions',
              label: 'Actions',
              actions: true,
              width: '5%',
              render: (row) => (
                <ActionMenu
                  items={[
                    { label: 'Edit', to: `/admin/products/${row.id}/edit` },
                    { label: 'Delete', onClick: () => setDeleteTarget(row), danger: true },
                  ]}
                />
              ),
            },
          ]}
          pagination={
            meta
              ? { page: meta.page, pageSize: meta.pageSize, total: meta.total, totalPages: meta.totalPages, onPageChange: setPage }
              : undefined
          }
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete product?"
        description={`This will permanently delete "${deleteTarget?.name}". This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}


function BoxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      <path d="M20 16.5v-9a2 2 0 0 0-1-1.7l-6-3.5a2 2 0 0 0-2 0l-6 3.5a2 2 0 0 0-1 1.7v9a2 2 0 0 0 1 1.7l6 3.5a2 2 0 0 0 2 0l6-3.5a2 2 0 0 0 1-1.7Z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="m5 12 5 5L19 7" />
    </svg>
  );
}
function StarIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 3Z" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}
function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
