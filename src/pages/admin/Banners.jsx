import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannerSummary,
} from '../../api/admin/banners.api';
import { useAsync } from '../../hooks/useAsync';
import { useDisclosure } from '../../hooks/useDisclosure';
import ImageUploader from '../../components/admin/form/ImageUploader';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/admin/PageHeader';
import StatTiles from '../../components/admin/StatTiles';
import { ImageIcon, CheckIcon, ClockIcon, CrossIcon } from '../../components/admin/tileIcons';
import { NoContentArt } from '../../components/ui/emptyArt';
import ActionMenu from '../../components/ui/ActionMenu';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { getErrorMessage } from '../../utils/errorMessage';
import Pagination from '../../components/ui/Pagination';
import { assetUrl } from '../../utils/media';

const emptyForm = {
  title: '',
  linkUrl: '',
  placement: 'home_hero',
  sortOrder: '',
  isActive: true,
  startsAt: '',
  endsAt: '',
};

export default function Banners() {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useAsync(() => listBanners({ page, pageSize: 10 }), [page]);
  const { data: summary } = useAsync(() => getBannerSummary(), []);
  const { isOpen, open, close } = useDisclosure(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const rows = data?.data || [];
  const meta = data?.meta;

  function field(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    open();
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      title: row.title || '',
      linkUrl: row.link_url || row.linkUrl || '',
      placement: row.placement || 'home_hero',
      sortOrder: String(row.sort_order ?? row.sortOrder ?? ''),
      isActive: Boolean(row.is_active ?? row.isActive ?? true),
      startsAt: (row.starts_at || row.startsAt || '').slice(0, 10),
      endsAt: (row.ends_at || row.endsAt || '').slice(0, 10),
    });
    setImageFile(null);
    open();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await updateBanner(editing.id, {
          title: form.title,
          linkUrl: form.linkUrl || undefined,
          placement: form.placement,
          sortOrder: form.sortOrder === '' ? undefined : Number(form.sortOrder),
          isActive: Boolean(form.isActive),
          startsAt: form.startsAt || undefined,
          endsAt: form.endsAt || undefined,
        });
        toast.success('Banner updated.');
      } else {
        if (!imageFile) {
          toast.error('Please choose an image.');
          setSubmitting(false);
          return;
        }
        await createBanner({
          image: imageFile,
          title: form.title,
          linkUrl: form.linkUrl || undefined,
          placement: form.placement,
          sortOrder: form.sortOrder === '' ? undefined : Number(form.sortOrder),
          isActive: form.isActive,
          startsAt: form.startsAt || undefined,
          endsAt: form.endsAt || undefined,
        });
        toast.success('Banner created.');
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
      await deleteBanner(deleteTarget.id);
      toast.success('Banner deleted.');
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
        title="Banners"
        subtitle="Promotional strips across your storefront, with optional start and end dates."
        actions={
          <Button variant="gold" onClick={openCreate}>
            Add Banner
          </Button>
        }
      />

      <StatTiles
        tiles={[
          { key: 'total', label: 'Total banners', value: summary?.total, tone: 'primary', icon: <ImageIcon /> },
          { key: 'showing', label: 'Showing now', value: summary?.showing, tone: 'good', icon: <CheckIcon /> },
          { key: 'scheduled', label: 'Scheduled', value: summary?.scheduled, tone: 'neutral', icon: <ClockIcon /> },
          { key: 'expired', label: 'Expired', value: summary?.expired, tone: 'neutral', icon: <CrossIcon /> },
        ]}
      />

      {error ? (
        <ErrorState message="Could not load banners." onRetry={refetch} />
      ) : loading ? (
        <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-white py-20">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white">
          <EmptyState
            art={<NoContentArt />}
            title="No banners yet"
            description="Banners are the promotional strips across your storefront — add one to fill the space."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((banner) => (
            <div key={banner.id} className="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white">
              <img
                src={assetUrl(banner.image_path)}
                alt={banner.title}
                className="h-36 w-full object-cover"
              />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="min-w-0 flex-1 text-sm font-semibold text-charcoal">
                    {banner.title || '(untitled)'}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1">
                    <Badge status={(banner.is_active ?? banner.isActive) ? 'active' : 'inactive'} />
                    <ActionMenu
                      items={[
                        { label: 'Edit', onClick: () => openEdit(banner) },
                        { label: 'Delete', onClick: () => setDeleteTarget(banner), danger: true },
                      ]}
                    />
                  </div>
                </div>
                <p className="text-xs text-charcoal-light">Placement: {banner.placement || '-'}</p>
                <p className="text-xs text-charcoal-light">
                  Sort order: {banner.sort_order ?? banner.sortOrder ?? 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta && (
        <div className="rounded-lg border border-stone-200 bg-white">
          <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
        </div>
      )}

      <Modal open={isOpen} onClose={close} title={editing ? 'Edit Banner' : 'Add Banner'} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="rounded-lg border border-stone-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-charcoal">Image</h3>
            {editing ? (
              <img src={assetUrl(editing.image_path)} alt="" className="h-32 w-full max-w-xs rounded-md object-cover" />
            ) : (
              <ImageUploader label="Banner image" onChange={setImageFile} />
            )}
          </div>

          <div className="rounded-lg border border-stone-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-charcoal">Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Title (optional)" value={form.title} onChange={field('title')} maxLength={150} />
              <Input label="Link URL" value={form.linkUrl} onChange={field('linkUrl')} />
              <Select label="Placement" value={form.placement} onChange={field('placement')}>
                <option value="home_hero">Home Hero</option>
                <option value="home_secondary">Home Secondary</option>
                <option value="home_promo">Home Promo (above footer)</option>
                <option value="category_top">Category Top</option>
                <option value="offers">Offers</option>
              </Select>
              <Input label="Sort Order" type="number" value={form.sortOrder} onChange={field('sortOrder')} />
              <Input label="Starts At" type="date" value={form.startsAt} onChange={field('startsAt')} />
              <Input label="Ends At" type="date" value={form.endsAt} onChange={field('endsAt')} />
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-stone-300"
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={submitting}>
              {editing ? 'Save Changes' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete banner?"
        description={`This will permanently delete "${deleteTarget?.title}". This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
