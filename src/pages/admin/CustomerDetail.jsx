import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCustomer, blockCustomer } from '../../api/admin/customers.api';
import { useAsync } from '../../hooks/useAsync';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';
import DataTable from '../../components/admin/table/DataTable';
import Badge from '../../components/ui/Badge';
import { WaitingForOrdersArt } from '../../components/ui/emptyArt';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';
import { getErrorMessage } from '../../utils/errorMessage';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: customer, loading, error, refetch } = useAsync(() => getCustomer(id), [id]);
  const [confirmingBlock, setConfirmingBlock] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !customer) {
    return <ErrorState message="Could not load this customer." onRetry={refetch} />;
  }

  const isBlocked = Boolean(customer.is_blocked ?? customer.isBlocked);

  async function handleBlock() {
    setSubmitting(true);
    try {
      await blockCustomer(id, true);
      toast.success('Customer blocked.');
      setConfirmingBlock(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnblock() {
    setSubmitting(true);
    try {
      await blockCustomer(id, false);
      toast.success('Customer unblocked.');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">{customer.name}</h1>
          <p className="text-sm text-charcoal-light">Customer since {formatDate(customer.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={isBlocked ? 'inactive' : 'active'}>{isBlocked ? 'Blocked' : 'Active'}</Badge>
          {isBlocked ? (
            <Button variant="outline" size="sm" loading={submitting} onClick={handleUnblock}>
              Unblock
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setConfirmingBlock(true)}>
              Block
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-charcoal">Order History</h3>
            <DataTable
              rows={customer.orders || []}
              onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
              emptyArt={<WaitingForOrdersArt />}
              emptyTitle="No orders from this customer"
              emptyMessage="Anything they order will be listed here."
              columns={[
                { key: 'order_number', label: 'Order #' },
                { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
                { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
                { key: 'created_at', label: 'Date', render: (row) => formatDateTime(row.created_at) },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-charcoal">Profile</h3>
            <p className="text-sm text-charcoal">{customer.email}</p>
            {customer.phone && <p className="text-sm text-charcoal-light">{customer.phone}</p>}
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-charcoal">Saved Addresses</h3>
            {(customer.addresses || []).length === 0 ? (
              <p className="text-sm text-charcoal-light">No saved addresses.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {customer.addresses.map((addr) => (
                  <div key={addr.id} className="rounded-md border border-stone-200 p-3 text-sm text-charcoal-light">
                    <p className="text-charcoal">{addr.full_name || addr.fullName}</p>
                    <p>{addr.address_line1 || addr.addressLine1}</p>
                    {(addr.address_line2 || addr.addressLine2) && <p>{addr.address_line2 || addr.addressLine2}</p>}
                    <p>
                      {addr.city}
                      {addr.postal_code || addr.postalCode ? `, ${addr.postal_code || addr.postalCode}` : ''}
                    </p>
                    {addr.phone && <p>{addr.phone}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingBlock}
        onClose={() => setConfirmingBlock(false)}
        onConfirm={handleBlock}
        title="Block this customer?"
        description="They will no longer be able to sign in or place new orders."
        confirmLabel="Block"
        danger
        loading={submitting}
      />
    </div>
  );
}
