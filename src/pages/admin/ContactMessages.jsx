import { useState } from 'react';
import {
  listContactMessages,
  markContactMessageRead,
  getContactSummary,
} from '../../api/admin/contactMessages.api';
import { useAsync } from '../../hooks/useAsync';
import { formatDateTime } from '../../utils/format';
import DataTable from '../../components/admin/table/DataTable';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/admin/PageHeader';
import StatTiles from '../../components/admin/StatTiles';
import { MailIcon, MailOpenIcon, ClockIcon, ListIcon } from '../../components/admin/tileIcons';
import { NoMessagesArt } from '../../components/ui/emptyArt';
import ActionMenu from '../../components/ui/ActionMenu';
import Modal from '../../components/ui/Modal';
import ErrorState from '../../components/ui/ErrorState';

export default function ContactMessages() {
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);

  const { data, loading, error, refetch } = useAsync(
    () => listContactMessages({ page, pageSize: 10 }),
    [page],
  );

  const { data: summary } = useAsync(() => getContactSummary(), []);

  const rows = data?.data || [];
  const meta = data?.meta;

  async function handleView(row) {
    setViewing(row);
    if (!row.is_read) {
      try {
        await markContactMessageRead(row.id);
        refetch();
      } catch {
        // non-critical — the message is still viewable
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Contact Messages"
        subtitle="Enquiries sent through the contact form on your storefront."
      />

      <StatTiles
        tiles={[
          { key: 'total', label: 'Total messages', value: summary?.total, tone: 'primary', icon: <ListIcon /> },
          { key: 'unread', label: 'Unread', value: summary?.unread, tone: summary?.unread > 0 ? 'warning' : 'neutral', icon: <MailIcon /> },
          { key: 'read', label: 'Read', value: summary?.read, tone: 'good', icon: <MailOpenIcon /> },
          { key: 'week', label: 'This week', value: summary?.thisWeek, tone: 'neutral', icon: <ClockIcon /> },
        ]}
      />

      {error ? (
        <ErrorState message="Could not load contact messages." onRetry={refetch} />
      ) : (
        <DataTable
          loading={loading}
          rows={rows}
          onRowClick={handleView}
          emptyArt={<NoMessagesArt />}
          emptyTitle="No messages yet"
          emptyMessage="Enquiries sent through the contact form on your storefront land here."
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            {
              key: 'message',
              label: 'Message',
              render: (row) => (
                <span className="block max-w-sm truncate" title={row.message}>
                  {row.message}
                </span>
              ),
            },
            { key: 'created_at', label: 'Received', render: (row) => formatDateTime(row.created_at) },
            {
              key: 'is_read',
              label: 'Status',
              render: (row) => <Badge status={row.is_read ? 'active' : 'pending'}>{row.is_read ? 'Read' : 'New'}</Badge>,
            },
            {
              key: 'actions',
              label: 'Actions',
              actions: true,
              render: (row) => <ActionMenu items={[{ label: 'View message', onClick: () => handleView(row) }]} />,
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

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Contact Message">
        {viewing && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-400">From</p>
              <p className="text-charcoal">{viewing.name} &lt;{viewing.email}&gt;</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-400">Received</p>
              <p className="text-charcoal">{formatDateTime(viewing.created_at)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-400">Message</p>
              <p className="whitespace-pre-wrap text-charcoal">{viewing.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
