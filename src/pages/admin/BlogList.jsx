import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listBlogPosts, deleteBlogPost, getBlogSummary } from '../../api/admin/blog.api';
import { useAsync } from '../../hooks/useAsync';
import { formatDate } from '../../utils/format';
import DataTable from '../../components/admin/table/DataTable';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/admin/PageHeader';
import StatTiles from '../../components/admin/StatTiles';
import { FileIcon, CheckIcon, PencilIcon, ImageIcon } from '../../components/admin/tileIcons';
import { NoContentArt } from '../../components/ui/emptyArt';
import ActionMenu from '../../components/ui/ActionMenu';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorState from '../../components/ui/ErrorState';
import { getErrorMessage } from '../../utils/errorMessage';

export default function BlogList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useAsync(() => listBlogPosts({ page, pageSize: 10 }), [page]);
  const { data: summary } = useAsync(() => getBlogSummary(), []);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const rows = data?.data || [];
  const meta = data?.meta;

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBlogPost(deleteTarget.id);
      toast.success('Post deleted.');
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
        title="Blog"
        subtitle="Posts shown in the blog section of your storefront."
        actions={
          <Button variant="gold" onClick={() => navigate('/admin/blog/new')}>
            New Post
          </Button>
        }
      />

      <StatTiles
        tiles={[
          { key: 'total', label: 'Total posts', value: summary?.total, tone: 'primary', icon: <FileIcon /> },
          { key: 'published', label: 'Published', value: summary?.published, tone: 'good', icon: <CheckIcon /> },
          { key: 'draft', label: 'Drafts', value: summary?.draft, tone: 'neutral', icon: <PencilIcon /> },
          { key: 'image', label: 'Missing image', value: summary?.missingImage, tone: summary?.missingImage > 0 ? 'warning' : 'neutral', icon: <ImageIcon /> },
        ]}
      />

      {error ? (
        <ErrorState message="Could not load blog posts." onRetry={refetch} />
      ) : (
        <DataTable
          loading={loading}
          rows={rows}
          emptyArt={<NoContentArt />}
          emptyTitle="No blog posts yet"
          emptyMessage="Write your first post to start filling the blog on your storefront."
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'category_name', label: 'Category', render: (row) => row.category_name || row.categoryName || '-' },
            { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
            {
              key: 'published_at',
              label: 'Published',
              render: (row) =>
                row.published_at || row.publishedAt ? formatDate(row.published_at || row.publishedAt) : '-',
            },
            {
              key: 'actions',
              label: 'Actions',
              actions: true,
              render: (row) => (
                <ActionMenu
                  items={[
                    { label: 'Edit', to: `/admin/blog/${row.id}/edit` },
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
        title="Delete post?"
        description={`This will permanently delete "${deleteTarget?.title}". This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
