import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryBanner,
  getCategorySummary,
  setCategoryVisibility,
} from '../../api/admin/categories.api';
import { useAsync } from '../../hooks/useAsync';
import { useDisclosure } from '../../hooks/useDisclosure';
import { cn } from '../../utils/cn';
import { assetUrl } from '../../utils/media';
import { getErrorMessage } from '../../utils/errorMessage';
import PageHeader from '../../components/admin/PageHeader';
import StatTiles from '../../components/admin/StatTiles';
import FilterBar, { FilterTab } from '../../components/admin/FilterBar';
import { NoCategoriesArt } from '../../components/ui/emptyArt';
import EmptyState from '../../components/ui/EmptyState';
import ActionMenu from '../../components/ui/ActionMenu';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';

const emptyForm = { name: '', description: '', sortOrder: '', isActive: true };

export default function Categories() {
  const { data: categories, loading, error, refetch } = useAsync(() => listCategories(), []);
  const { data: summary, refetch: refetchSummary } = useAsync(() => getCategorySummary(), []);
  const { isOpen, open, close } = useDisclosure(false);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [busy, setBusy] = useState({});

  const all = useMemo(() => categories || [], [categories]);
  const counts = useMemo(
    () => ({
      all: all.length,
      visible: all.filter((c) => c.is_active).length,
      hidden: all.filter((c) => !c.is_active).length,
    }),
    [all],
  );

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all.filter((category) => {
      if (tab === 'visible' && !category.is_active) return false;
      if (tab === 'hidden' && category.is_active) return false;
      if (term && !category.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [all, search, tab]);

  const nameById = useMemo(() => new Map(all.map((c) => [String(c.id), c.name])), [all]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    open();
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      name: row.name || '',
      description: row.description || '',
      sortOrder: String(row.sort_order ?? ''),
      isActive: Boolean(row.is_active ?? true),
    });
    open();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        sortOrder: form.sortOrder === '' ? undefined : Number(form.sortOrder),
      };
      if (editing) {
        await updateCategory(editing.id, { ...payload, isActive: Boolean(form.isActive) });
        toast.success('Category updated.');
      } else {
        await createCategory(payload);
        toast.success('Category created.');
      }
      close();
      refetch();
      refetchSummary();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success('Category deleted.');
      setDeleteTarget(null);
      refetch();
      refetchSummary();
    } catch (err) {
      const message = getErrorMessage(err, 'Something went wrong');
      toast.error(
        err.response?.status === 409 ? `${message} This category still has products or subcategories.` : message,
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleBannerUpload(id, file) {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      await uploadCategoryBanner(id, file);
      toast.success('Banner uploaded.');
      refetch();
      refetchSummary();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  }

  async function handleVisibility(category, next) {
    setBusy((b) => ({ ...b, [category.id]: true }));
    try {
      await setCategoryVisibility(category.id, next);
      refetch();
      refetchSummary();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update this category.'));
    } finally {
      setBusy((b) => ({ ...b, [category.id]: false }));
    }
  }

  const tiles = [
    { key: 'total', label: 'Total categories', value: summary?.total, tone: 'primary', icon: <TagIcon /> },
    { key: 'visible', label: 'Visible on store', value: summary?.visible, tone: 'good', icon: <EyeIcon /> },
    {
      key: 'products',
      label: 'Products assigned',
      value: summary?.productsAssigned,
      tone: 'neutral',
      icon: <BoxIcon />,
      to: '/admin/products',
    },
    {
      key: 'banner',
      label: 'Missing banner',
      value: summary?.missingBanner,
      // Only a problem when it is non-zero, so it stays neutral at zero rather than
      // colouring a row that has nothing wrong with it.
      tone: summary?.missingBanner > 0 ? 'warning' : 'neutral',
      icon: <ImageIcon />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Categories"
        subtitle="Organise how products are grouped and shown in the storefront menu."
        actions={
          <Button variant="gold" onClick={openCreate}>
            Add Category
          </Button>
        }
      />

      <StatTiles tiles={tiles} />

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search categories' }}
        tabs={
          <>
            <FilterTab active={tab === 'all'} onClick={() => setTab('all')} count={counts.all}>
              All
            </FilterTab>
            <FilterTab active={tab === 'visible'} onClick={() => setTab('visible')} count={counts.visible}>
              Visible
            </FilterTab>
            <FilterTab active={tab === 'hidden'} onClick={() => setTab('hidden')} count={counts.hidden}>
              Hidden
            </FilterTab>
          </>
        }
      />

      {error ? (
        <ErrorState message="Could not load categories." onRetry={refetch} />
      ) : loading ? (
        <div className="flex items-center justify-center rounded-xl border border-stone-200 bg-white py-20">
          <Spinner />
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-stone-300 bg-white md:border-stone-200">
          <EmptyState
            art={<NoCategoriesArt />}
            title={all.length === 0 ? 'No categories yet' : 'Nothing matches those filters'}
            description={
              all.length === 0
                ? 'Categories come first — a product needs one before you can list it.'
                : 'Try a different search, or switch back to All.'
            }
            action={
              all.length === 0 ? (
                <Button variant="gold" onClick={openCreate}>
                  Add Category
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              parentName={category.parent_id ? nameById.get(String(category.parent_id)) : null}
              busy={Boolean(busy[category.id])}
              onEdit={() => openEdit(category)}
              onDelete={() => setDeleteTarget(category)}
              onBanner={(file) => handleBannerUpload(category.id, file)}
              onVisibility={(next) => handleVisibility(category, next)}
            />
          ))}

          <button
            type="button"
            onClick={openCreate}
            className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 text-charcoal-light transition-colors hover:border-gold-400 hover:bg-gold-50/40 hover:text-gold-700"
          >
            <PlusIcon />
            <span className="text-sm font-medium">Add category</span>
          </button>
        </div>
      )}

      <Modal open={isOpen} onClose={close} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            minLength={2}
            maxLength={150}
            required
          />
          <Textarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex flex-col gap-1">
            <Input
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
            />
            <p className="text-xs text-charcoal-light">Lower numbers come first in the storefront menu.</p>
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-stone-300"
              />
              Visible on the storefront
            </label>
          )}
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={submitting}>
              {editing ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete category?"
        description={`This will permanently delete "${deleteTarget?.name}". This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}

function CategoryCard({ category, parentName, busy, onEdit, onDelete, onBanner, onVisibility }) {
  const fileRef = useRef(null);
  const banner = category.banner_image;
  const productCount = Number(category.product_count ?? 0);
  const visible = Boolean(category.is_active);

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-sm',
        busy && 'opacity-60',
      )}
    >
      <div className="relative">
        {/* The banner doubles as the dropzone: an empty slot is the only cue that one is
            missing, so it asks for the upload rather than hiding it behind the edit form. */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          title={banner ? 'Replace banner' : 'Upload banner'}
          className={cn(
            'flex h-28 w-full items-center justify-center overflow-hidden',
            banner ? 'bg-stone-100' : 'border-b border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100',
          )}
        >
          {banner ? (
            <img src={assetUrl(banner)} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-charcoal-light">
              <UploadIcon />
              <span className="text-xs font-medium">Upload banner</span>
            </span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onBanner(file);
            e.target.value = '';
          }}
        />

        <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-charcoal-light">
          #{category.sort_order ?? 0}
        </span>
        {parentName && (
          <span className="absolute right-2 top-2 rounded bg-charcoal px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Subcategory
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <div className="flex items-start gap-2">
          <span
            className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', visible ? 'bg-green-600' : 'bg-stone-300')}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-charcoal">{category.name}</span>
        </div>
        <p className="pl-4 text-xs text-charcoal-light">
          {productCount} product{productCount === 1 ? '' : 's'}
          {parentName ? ` · in ${parentName}` : ''}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-stone-100 px-3 py-2">
        <span className="flex items-center gap-2">
          <Toggle
            checked={visible}
            disabled={busy}
            onChange={onVisibility}
            label={`${category.name} visible on the storefront`}
          />
          <span className={cn('text-xs font-medium', visible ? 'text-charcoal' : 'text-charcoal-light')}>
            {visible ? 'Visible' : 'Hidden'}
          </span>
        </span>
        <ActionMenu
          items={[
            { label: 'Edit', onClick: onEdit },
            { label: banner ? 'Replace banner' : 'Upload banner', onClick: () => fileRef.current?.click() },
            { label: 'Delete', onClick: onDelete, danger: true },
          ]}
        />
      </div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 2H3v9l10.3 10.3a1 1 0 0 0 1.4 0l7.6-7.6a1 1 0 0 0 0-1.4L12 2Z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
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
function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m21 16-5-5-7 7" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 17V5M7 10l5-5 5 5M4 21h16" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
