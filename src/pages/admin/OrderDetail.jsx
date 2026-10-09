import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrder, updateOrderStatus } from '../../api/admin/orders.api';
import { useAsync } from '../../hooks/useAsync';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';
import { getErrorMessage } from '../../utils/errorMessage';

const NEXT_STATUSES = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
  returned: [],
};

export default function OrderDetail() {
  const { id } = useParams();
  const { data: order, loading, error, refetch } = useAsync(() => getOrder(id), [id]);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !order) {
    return <ErrorState message="Could not load this order." onRetry={refetch} />;
  }

  const nextStatuses = NEXT_STATUSES[order.status] || [];

  async function handleConfirmStatusChange() {
    setSubmitting(true);
    try {
      await updateOrderStatus(id, { status: pendingStatus, note: note || undefined });
      toast.success(`Order marked as ${pendingStatus}.`);
      setPendingStatus(null);
      setNote('');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">Order {order.order_number}</h1>
          <p className="text-sm text-charcoal-light">Placed {formatDateTime(order.created_at)}</p>
        </div>
        <Badge status={order.status} className="text-sm" />
      </div>

      {nextStatuses.length > 0 && (
        <div className="flex flex-wrap gap-3 rounded-lg border border-stone-200 bg-white p-4">
          <span className="self-center text-sm text-charcoal-light">Update status:</span>
          {nextStatuses.map((s) => (
            <Button
              key={s}
              variant={s === 'cancelled' ? 'danger' : 'gold'}
              size="sm"
              onClick={() => setPendingStatus(s)}
            >
              Mark as {s}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-charcoal">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-charcoal-light">
                    <th className="py-2 pr-4 font-medium">Product</th>
                    <th className="py-2 pr-4 font-medium">Variant</th>
                    <th className="py-2 pr-4 font-medium">Qty</th>
                    <th className="py-2 pr-4 font-medium">Price</th>
                    <th className="py-2 pr-4 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item) => (
                    <tr key={item.id} className="border-b border-stone-100 last:border-0">
                      <td className="py-2.5 pr-4 text-charcoal">{item.product_name || item.name}</td>
                      <td className="py-2.5 pr-4 text-charcoal-light">
                        {[item.spec, item.condition_grade].filter(Boolean).join(' / ')}
                      </td>
                      <td className="py-2.5 pr-4 text-charcoal">{item.quantity}</td>
                      <td className="py-2.5 pr-4 text-charcoal">{formatCurrency(item.price)}</td>
                      <td className="py-2.5 pr-4 text-charcoal">
                        {formatCurrency((item.price || 0) * (item.quantity || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <span className="text-base font-semibold text-charcoal">Total: {formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-charcoal">Status History</h3>
            {(order.history || []).length === 0 ? (
              <p className="text-sm text-charcoal-light">No history yet.</p>
            ) : (
              <ol className="flex flex-col gap-4 border-l-2 border-stone-200 pl-4">
                {order.history.map((h, idx) => (
                  <li key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-gold-500" />
                    <div className="flex items-center gap-2">
                      <Badge status={h.status} />
                      <span className="text-xs text-stone-400">{formatDateTime(h.created_at)}</span>
                    </div>
                    {h.changed_by && (
                      <p className="mt-1 text-xs text-charcoal-light">By {h.actor_name || h.changed_by}</p>
                    )}
                    {h.note && <p className="mt-1 text-sm text-charcoal">{h.note}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-charcoal">Customer</h3>
            <p className="text-sm text-charcoal">{order.customer_name}</p>
            <p className="text-sm text-charcoal-light">{order.customer_email}</p>
            {order.customer_phone && <p className="text-sm text-charcoal-light">{order.customer_phone}</p>}
            {order.customer_id && (
              <Link
                to={`/admin/customers/${order.customer_id}`}
                className="mt-2 inline-block text-xs font-medium text-gold-600 hover:text-gold-700"
              >
                View customer profile
              </Link>
            )}
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-charcoal">Shipping Address</h3>
            {order.shipping_address ? (
              <div className="text-sm text-charcoal-light">
                <p className="text-charcoal">{order.shipping_address.fullName || order.shipping_address.full_name}</p>
                <p>{order.shipping_address.addressLine1 || order.shipping_address.address_line1}</p>
                {(order.shipping_address.addressLine2 || order.shipping_address.address_line2) && (
                  <p>{order.shipping_address.addressLine2 || order.shipping_address.address_line2}</p>
                )}
                <p>
                  {order.shipping_address.city}
                  {order.shipping_address.postalCode ? `, ${order.shipping_address.postalCode}` : ''}
                </p>
                {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-charcoal-light">No shipping address on file.</p>
            )}
          </div>

          {order.payment_method && (
            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-charcoal">Payment</h3>
              <p className="text-sm text-charcoal-light">
                Method: {order.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={Boolean(pendingStatus)}
        onClose={() => {
          setPendingStatus(null);
          setNote('');
        }}
        title={`Mark order as ${pendingStatus}?`}
      >
        <p className="mb-4 text-sm text-charcoal-light">
          {pendingStatus === 'cancelled'
            ? 'This will cancel the order. You can add an optional note below.'
            : `The customer will see this order as "${pendingStatus}".`}
        </p>
        {pendingStatus === 'cancelled' && (
          <Textarea
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for cancellation..."
            rows={3}
            className="mb-4"
          />
        )}
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            disabled={submitting}
            onClick={() => {
              setPendingStatus(null);
              setNote('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant={pendingStatus === 'cancelled' ? 'danger' : 'gold'}
            loading={submitting}
            onClick={handleConfirmStatusChange}
          >
            Mark as {pendingStatus}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
