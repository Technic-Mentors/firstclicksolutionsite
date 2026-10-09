import { useParams, Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getMyOrder } from '../api/orders.api';
import { getPublicSettings } from '../api/settings.api';
import { useAuthStore } from '../store/useAuthStore';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/format';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const customer = useAuthStore((s) => s.customer);
  const { data: order, loading, error, refetch } = useAsync(() => getMyOrder(id), [id]);
  const { data: settings } = useAsync(() => getPublicSettings(), []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (error || !order) return <ErrorState message="Order not found." onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
      <div className="mb-4 text-5xl">🎉</div>
      <h1 className="mb-2 font-serif text-3xl text-charcoal">Thank you for your order!</h1>
      <p className="mb-2 text-charcoal-light">
        Order <span className="font-medium text-charcoal">{order.order_number}</span> has been placed. We'll call you
        shortly to confirm.
      </p>
      {customer?.email && (
        <p className="mb-8 text-sm text-charcoal-light">
          A confirmation email has been sent to <span className="font-medium text-charcoal">{customer.email}</span>.
        </p>
      )}

      <div className="rounded-md border border-stone-200 p-6 text-left">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-charcoal-light">Status</span>
          <Badge status={order.status} />
        </div>
        <div className="space-y-2 border-t border-stone-100 pt-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product_name} ({item.spec}/{item.condition_grade}) × {item.quantity}
              </span>
              <span>{formatCurrency(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-stone-100 pt-4 font-medium text-charcoal">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {order.payment_method === 'bank_transfer' && (
        <div className="mt-6 rounded-md border border-gold-200 bg-gold-50 p-6 text-left text-sm">
          <p className="mb-3 font-medium text-charcoal">Complete your payment via Bank Transfer</p>
          <div className="space-y-1 text-charcoal-light">
            {settings?.bank_name && (
              <p>
                <span className="font-medium text-charcoal">Bank:</span> {settings.bank_name}
              </p>
            )}
            {settings?.bank_account_holder && (
              <p>
                <span className="font-medium text-charcoal">Account Holder:</span> {settings.bank_account_holder}
              </p>
            )}
            {settings?.bank_account_number && (
              <p>
                <span className="font-medium text-charcoal">Account Number:</span> {settings.bank_account_number}
              </p>
            )}
            {settings?.bank_iban && (
              <p>
                <span className="font-medium text-charcoal">IBAN:</span> {settings.bank_iban}
              </p>
            )}
            {settings?.bank_additional_info && <p>{settings.bank_additional_info}</p>}
          </div>
          <p className="mt-3 text-charcoal-light">
            Transfer the amount above, then send your payment receipt on WhatsApp. Your order will be
            processed once the receipt is verified.
          </p>
          {settings?.payment_whatsapp_number && (
            <a
              href={`https://wa.me/${settings.payment_whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hi, I've made a bank transfer for order ${order.order_number}. Attaching my payment receipt.`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform duration-200 hover:scale-105"
            >
              <svg viewBox="0 0 32 32" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.001 3C9.376 3 4 8.376 4 15c0 2.378.694 4.59 1.885 6.45L4 29l7.76-1.832A11.94 11.94 0 0 0 16 27c6.624 0 12-5.376 12-12S22.625 3 16.001 3zm0 21.75a9.68 9.68 0 0 1-4.94-1.352l-.354-.21-4.605 1.087 1.115-4.486-.23-.368A9.7 9.7 0 0 1 6.25 15c0-5.376 4.375-9.75 9.75-9.75 5.376 0 9.75 4.374 9.75 9.75 0 5.376-4.374 9.75-9.75 9.75zm5.35-7.296c-.294-.147-1.737-.857-2.006-.954-.27-.098-.466-.147-.662.147-.196.294-.759.954-.93 1.15-.173.196-.343.22-.637.074-.294-.147-1.243-.458-2.367-1.46-.875-.78-1.465-1.744-1.637-2.038-.172-.294-.018-.453.128-.6.13-.13.294-.343.44-.515.147-.171.196-.294.294-.49.098-.196.049-.368-.024-.515-.074-.147-.662-1.598-.908-2.188-.238-.574-.48-.497-.662-.506l-.564-.01c-.196 0-.514.073-.784.367-.27.294-1.029 1.006-1.029 2.452s1.054 2.844 1.2 3.04c.147.196 2.073 3.166 5.023 4.44.702.302 1.25.482 1.677.617.705.223 1.347.191 1.855.116.566-.084 1.737-.71 1.983-1.396.245-.687.245-1.276.172-1.396-.074-.122-.27-.196-.564-.343z" />
              </svg>
              Send Receipt on WhatsApp
            </a>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <Link to="/account/orders">
          <Button variant="outline">View My Orders</Button>
        </Link>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
