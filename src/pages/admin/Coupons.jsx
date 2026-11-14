import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponSummary,
} from '../../api/admin/coupons.api';
import { listCategories } from '../../api/admin/categories.api';
import { useAsync } from '../../hooks/useAsync';
import { useDisclosure } from '../../hooks/useDisclosure';
import { formatDate } from '../../utils/format';
import DataTable from '../../components/admin/table/DataTable';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/admin/PageHeader';
import StatTiles from '../../components/admin/StatTiles';
import { TicketIcon, CheckIcon, ClockIcon, CoinIcon } from '../../components/admin/tileIcons';
import { NoCouponsArt } from '../../components/ui/emptyArt';
import ActionMenu from '../../components/ui/ActionMenu';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { getErrorMessage } from '../../utils/errorMessage';
import ErrorState from '../../components/ui/ErrorState';

const emptyForm = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderValue: '',
  maxDiscountAmount: '',
  usageLimitTotal: '',
  usageLimitPerCustomer: '',
  categoryId: '',
  isActive: true,
  startsAt: '',
  expiresAt: '',
};

export default function Coupons() {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useAsync(() => listCoupons({ page, pageSize: 10 }), [page]);
  const { data: categories } = useAsync(() => listCategories(), []);
  const { data: summary } = useAsync(() => getCouponSummary(), []);
  const { isOpen, open, close } = useDisclosure(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const rows = data?.data || [];
  const meta = data?.meta;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    open();
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      code: row.code || '',
      type: row.type || 'percentage',
      value: String(row.value ?? ''),
      minOrderValue: String(row.min_order_value ?? row.minOrderValue ?? ''),
      maxDiscountAmount: String(row.max_discount_amount ?? row.maxDiscountAmount ?? ''),
      usageLimitTotal: String(row.usage_limit_total ?? row.usageLimitTotal ?? ''),
      usageLimitPerCustomer: String(row.usage_limit_per_customer ?? row.usageLimitPerCustomer ?? ''),
      categoryId: String(row.category_id ?? row.categoryId ?? ''),
      isActive: Boolean(row.is_active ?? row.isActive ?? true),
      startsAt: (row.starts_at || row.startsAt || '').slice(0, 10),
      expiresAt: (row.expires_at || row.expiresAt || '').slice(0, 10),
    });
    open();
  }

  function field(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderValue: form.minOrderValue === '' ? undefined : Number(form.minOrderValue),
        maxDiscountAmount: form.maxDiscountAmount === '' ? undefined : Number(form.maxDiscountAmount),
        usageLimitTotal: form.usageLimitTotal === '' ? undefined : Number(form.usageLimitTotal),
        usageLimitPerCustomer: form.usageLimitPerCustomer === '' ? undefined : Number(form.usageLimitPerCustomer),
        categoryId: form.categoryId === '' ? undefined : Number(form.categoryId),
        isActive: Boolean(form.isActive),
        startsAt: form.startsAt || undefined,
        expiresAt: form.expiresAt || undefined,
      };
      if (editing) {
        await updateCoupon(editing.id, payload);
        toast.success('Coupon updated.');
      } else {
        await createCoupon(payload);
        toast.success('Coupon created.');
      }
      close();
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteCoupon(deleteTarget.id);
      toast.success('Coupon deleted.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Coupons"
        subtitle="Discount codes customers can apply at checkout."
        actions={
          <Button variant="gold" onClick={openCreate}>
            Add Coupon
          </Button>
        }
      />

      <StatTiles
        tiles={[
          { key: 'total', label: 'Total coupons', value: summary?.total, tone: 'primary', icon: <TicketIcon /> },
          { key: 'live', label: 'Live right now', value: summary?.live, tone: 'good', icon: <CheckIcon /> },
          { key: 'expired', label: 'Expired', value: summary?.expired, tone: 'neutral', icon: <ClockIcon /> },
          { key: 'uses', label: 'Times redeemed', value: summary?.totalUses, tone: 'accent', icon: <CoinIcon /> },
        ]}
      />

      {error ? (
        <ErrorState message="Could not load coupons." onRetry={refetch} />
      ) : (
        <DataTable
          loading={loading}
          rows={rows}
          emptyArt={<NoCouponsArt />}
          emptyTitle="No coupons yet"
          emptyMessage="Create a discount code and it will show up here with its usage count."
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'type', label: 'Type', render: (row) => (row.type === 'percentage' ? 'Percentage' : 'Fixed') },
            {
              key: 'value',
              label: 'Value',
              render: (row) => (row.type === 'percentage' ? `${row.value}%` : `Rs. ${row.value}`),
            },
            { key: 'times_used', label: 'Times Used', render: (row) => row.times_used ?? row.timesUsed ?? 0 },
            {
              key: 'is_active',
              label: 'Status',
              render: (row) => <Badge status={(row.is_active ?? row.isActive) ? 'active' : 'inactive'} />,
            },
            {
              key: 'expires_at',
              label: 'Expires',
              render: (row) => (row.expires_at || row.expiresAt ? formatDate(row.expires_at || row.expiresAt) : '-'),
            },
            {
              key: 'actions',
              label: 'Actions',
              actions: true,
              render: (row) => (
                <ActionMenu
                  items={[
                    { label: 'Edit', onClick: () => openEdit(row) },
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

      <Modal open={isOpen} onClose={close} title={editing ? 'Edit Coupon' : 'Add Coupon'} className="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Code" value={form.code} onChange={field('code')} minLength={3} maxLength={50} required />
            <Select label="Type" value={form.type} onChange={field('type')}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </Select>
            <Input
              label="Value"
              type="number"
              step="0.01"
              min="0.01"
              max={form.type === 'percentage' ? '100' : undefined}
              value={form.value}
              onChange={field('value')}
              required
            />
            <Input
              label="Min Order Value"
              type="number"
              step="0.01"
              min="0"
              value={form.minOrderValue}
              onChange={field('minOrderValue')}
            />
            <Input
              label="Max Discount Amount"
              type="number"
              step="0.01"
              min="0.01"
              value={form.maxDiscountAmount}
              onChange={field('maxDiscountAmount')}
            />
            <SearchableSelect
              label="Applies to Category"
              value={form.categoryId}
              onChange={(val) => setForm((f) => ({ ...f, categoryId: val }))}
              options={[
                { value: '', label: 'All categories' },
                ...(categories || []).map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <Input
              label="Usage Limit (Total)"
              type="number"
              min="1"
              step="1"
              value={form.usageLimitTotal}
              onChange={field('usageLimitTotal')}
            />
            <Input
              label="Usage Limit (Per Customer)"
              type="number"
              min="1"
              step="1"
              value={form.usageLimitPerCustomer}
              onChange={field('usageLimitPerCustomer')}
            />
            <Input label="Starts At" type="date" value={form.startsAt} onChange={field('startsAt')} />
            <Input label="Expires At" type="date" value={form.expiresAt} onChange={field('expiresAt')} />
          </div>
          <label className="flex items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-stone-300"
            />
            Active
          </label>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={submitting}>
              {editing ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete coupon?"
        description={`This will permanently delete "${deleteTarget?.code}". This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
