import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAsync } from '../../hooks/useAsync';
import { getMyOrder, cancelOrder } from '../../api/orders.api';
import { getReviewableOrderItems } from '../../api/reviews.api';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import ReviewForm from '../../components/product/ReviewForm';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';

const STATUS_STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);

  const { data: order, loading, error, refetch } = useAsync(() => getMyOrder(id), [id]);
  const { data: reviewable, refetch: refetchReviewable } = useAsync(() => getReviewableOrderItems(), [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }
  if (error || !order) return <ErrorState message="Order not found." onRetry={refetch} />;

  const reviewableForThisOrder = reviewable?.filter((item) => item.order_id === Number(id)) || [];
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isException = order.status === 'cancelled' || order.status === 'returned';

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelOrder(id, 'Cancelled by customer');
      toast.success('Order cancelled.');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not cancel order.'));
    } finally {
      setCancelling(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">{order.order_number}</h2>
          <p className="text-sm text-stone-400">{formatDateTime(order.created_at)}</p>
        </div>
        <Badge status={order.status} />
      </div>

      {!isException && (
        <div className="flex items-center">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  i <= stepIndex ? 'bg-gold-500 text-white' : 'bg-stone-200 text-stone-500'
                }`}
              >
                {i + 1}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 ${i < stepIndex ? 'bg-gold-500' : 'bg-stone-200'}`} />
              )}
            </div>
          ))}
        </div>
      )}
      {!isException && (
        <div className="flex justify-between text-xs capitalize text-charcoal-light">
          {STATUS_STEPS.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
      )}

      {order.status === 'placed' && (
        <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)}>
          Cancel Order
        </Button>
      )}

      {order.status === 'cancelled' && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">This order was cancelled{order.cancelled_by === 'admin' ? ' by our team' : ''}.</p>
          {order.cancelled_reason && <p className="mt-1 text-red-700">Reason: {order.cancelled_reason}</p>}
        </div>
      )}

      <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-medium text-charcoal">Items</h3>
        <div className="space-y-2">
          {order.items.map((item) => {
            const reviewableItem = reviewableForThisOrder.find((r) => r.id === item.id);
            return (
              <div key={item.id} className="flex items-center justify-between border-b border-stone-100 py-2 text-sm">
                <span>
                  {item.product_name} ({item.spec}/{item.condition_grade}) × {item.quantity}
                </span>
                <div className="flex items-center gap-3">
                  <span>{formatCurrency(item.line_total)}</span>
                  {reviewableItem && (
                    <button
                      onClick={() => setReviewItem(reviewableItem)}
                      className="text-xs font-medium text-gold-600 hover:text-gold-700"
                    >
                      Write a Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex justify-between font-medium text-charcoal">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm text-sm">
        <h3 className="mb-2 font-medium text-charcoal">Delivery Address</h3>
        <p className="text-charcoal-light">
          {order.shipping_full_name} · {order.shipping_phone}
          <br />
          {order.shipping_address_line1}
          {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ''}, {order.shipping_city}
        </p>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel this order?"
        description="This cannot be undone."
        confirmLabel="Cancel Order"
        danger
      />

      <Modal open={!!reviewItem} onClose={() => setReviewItem(null)} title="Write a Review">
        {reviewItem && (
          <ReviewForm
            orderItemId={reviewItem.id}
            onSubmitted={() => {
              setReviewItem(null);
              refetchReviewable();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
