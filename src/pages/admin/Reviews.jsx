import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  listReviews,
  createReview,
  approveReview,
  rejectReview,
  deleteReview,
  getReviewSummary,
} from '../../api/admin/reviews.api';
import { listProducts } from '../../api/admin/products.api';
import { useAsync } from '../../hooks/useAsync';
import DataTable from '../../components/admin/table/DataTable';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/admin/PageHeader';
import StatTiles from '../../components/admin/StatTiles';
import { StarIcon, ClockIcon, CheckIcon, CrossIcon } from '../../components/admin/tileIcons';
import { NoReviewsArt } from '../../components/ui/emptyArt';
import ActionMenu from '../../components/ui/ActionMenu';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import StarRating from '../../components/ui/Stars';
import Modal from '../../components/ui/Modal';
import { getErrorMessage } from '../../utils/errorMessage';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorState from '../../components/ui/ErrorState';

const emptyForm = { productId: '', rating: 0, title: '', comment: '' };

function Stars({ rating }) {
  const n = Number(rating) || 0;
  return (
    <span className="text-amber-500" aria-label={`${n} out of 5 stars`}>
      {'★'.repeat(n)}
      <span className="text-stone-300">{'★'.repeat(Math.max(0, 5 - n))}</span>
    </span>
  );
}

export default function Reviews() {
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useAsync(
    () => listReviews({ status: status || undefined, page, pageSize: 10 }),
    [status, page],
  );

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [adding, setAdding] = useState(false);

  const { data: productsData } = useAsync(() => listProducts({ pageSize: 500, sort: 'name_asc' }), []);
  const { data: summary } = useAsync(() => getReviewSummary(), []);
  const productOptions = (productsData?.data || []).map((p) => ({ value: p.id, label: p.name }));

  const rows = data?.data || [];
  const meta = data?.meta;

  function field(name) {
    return (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  }

  async function handleAddReview() {
    const errors = {};
    if (!form.productId) errors.productId = 'Select a product';
    if (!form.rating) errors.rating = 'Select a rating';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setAdding(true);
    try {
      await createReview({
        productId: form.productId,
        rating: form.rating,
        title: form.title || undefined,
        comment: form.comment || undefined,
      });
      toast.success('Review added.');
      setAddOpen(false);
      setForm(emptyForm);
      setFormErrors({});
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setAdding(false);
    }
  }

  async function handleApprove(row) {
    try {
      await approveReview(row.id);
      toast.success('Review approved.');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    }
  }

  async function handleReject(row) {
    try {
      await rejectReview(row.id);
      toast.success('Review rejected.');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      await deleteReview(deleteTarget.id);
      toast.success('Review deleted.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Reviews"
        subtitle="Customer reviews wait here for approval before they appear on the storefront."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            Add Review
          </Button>
        }
      />

      <StatTiles
        tiles={[
          { key: 'total', label: 'Total reviews', value: summary?.total, tone: 'primary', icon: <StarIcon /> },
          { key: 'pending', label: 'Awaiting approval', value: summary?.pending, tone: summary?.pending > 0 ? 'warning' : 'neutral', icon: <ClockIcon /> },
          { key: 'approved', label: 'Published', value: summary?.approved, tone: 'good', icon: <CheckIcon /> },
          { key: 'rating', label: 'Average rating', value: summary?.averageRating || undefined, tone: 'accent', icon: <StarIcon /> },
          { key: 'rejected', label: 'Rejected', value: summary?.rejected, tone: 'neutral', icon: <CrossIcon /> },
        ]}
      />

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white p-4">
        <div className="w-52">
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </Select>
        </div>
      </div>

      {error ? (
        <ErrorState message="Could not load reviews." onRetry={refetch} />
      ) : (
        <DataTable
          loading={loading}
          rows={rows}
          emptyArt={<NoReviewsArt />}
          emptyTitle="No reviews found"
          emptyMessage="Customer reviews land here for approval before they appear on the storefront."
          columns={[
            {
              key: 'product_name',
              label: 'Product',
              render: (row) =>
                row.product_slug ? (
                  <Link to={`/product/${row.product_slug}`} className="text-gold-600 hover:text-gold-700">
                    {row.product_name}
                  </Link>
                ) : (
                  row.product_name
                ),
            },
            { key: 'customer_name', label: 'Customer' },
            { key: 'rating', label: 'Rating', render: (row) => <Stars rating={row.rating} /> },
            {
              key: 'comment',
              label: 'Comment',
              render: (row) => (
                <span className="block max-w-xs truncate" title={row.comment}>
                  {row.title ? <strong className="mr-1">{row.title}</strong> : null}
                  {row.comment}
                </span>
              ),
            },
            { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
            {
              key: 'actions',
              label: 'Actions',
              actions: true,
              render: (row) => (
                <ActionMenu
                  items={[
                    row.status === 'pending' ? { label: 'Approve', onClick: () => handleApprove(row) } : null,
                    row.status === 'pending'
                      ? { label: 'Reject', onClick: () => handleReject(row), danger: true }
                      : null,
                    { label: 'Delete', onClick: () => setDeleteTarget(row), danger: true },
                  ]}
                />
              ),
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete review?"
        description="This will permanently delete this review. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={submitting}
      />

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setForm(emptyForm);
          setFormErrors({});
        }}
        title="Add Review"
      >
        <div className="space-y-4">
          <SearchableSelect
            label="Product"
            value={form.productId}
            onChange={(val) => setForm((f) => ({ ...f, productId: val }))}
            options={productOptions}
            placeholder="Select a product..."
            error={formErrors.productId}
          />
          <div>
            <p className="mb-1.5 text-sm font-medium text-charcoal-light">Rating</p>
            <StarRating
              value={form.rating}
              interactive
              size="lg"
              onChange={(n) => setForm((f) => ({ ...f, rating: n }))}
            />
            {formErrors.rating && <p className="mt-1 text-xs text-red-600">{formErrors.rating}</p>}
          </div>
          <Input label="Title (optional)" value={form.title} onChange={field('title')} />
          <Textarea label="Comment (optional)" rows={4} value={form.comment} onChange={field('comment')} />
          <p className="text-xs text-charcoal-light">
            This review will be shown on the website as "Anonymous Customer" and published immediately.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" disabled={adding} onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button loading={adding} onClick={handleAddReview}>
              Add Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
