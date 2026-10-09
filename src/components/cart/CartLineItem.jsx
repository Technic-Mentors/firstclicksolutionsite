import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { assetUrl } from '../../utils/media';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useCartStore } from '../../store/useCartStore';

export default function CartLineItem({ item }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  function decrease() {
    if (item.quantity > 1) updateQuantity(item.variantId, item.quantity - 1);
  }
  function increase() {
    if (item.quantity < item.stockQuantity) updateQuantity(item.variantId, item.quantity + 1);
  }

  return (
    <div className="flex gap-4 border-b border-stone-100 py-5">
      <Link to={`/product/${item.productSlug}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-md bg-stone-100">
        {item.primaryImage && <img src={assetUrl(item.primaryImage)} alt="" className="h-full w-full object-cover" />}
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link to={`/product/${item.productSlug}`} className="font-serif text-base text-charcoal hover:text-gold-600">
            {item.productName}
          </Link>
          <p className="text-xs text-stone-500">
            {item.spec} / {item.condition_grade}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-md border border-stone-300">
            <button onClick={decrease} className="px-2.5 py-1 text-charcoal-light hover:text-gold-600">
              −
            </button>
            <span className="min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
            <button
              onClick={increase}
              disabled={item.quantity >= item.stockQuantity}
              className="px-2.5 py-1 text-charcoal-light hover:text-gold-600 disabled:opacity-30"
            >
              +
            </button>
          </div>
          <button onClick={() => setConfirmOpen(true)} className="text-xs text-stone-400 hover:text-red-600">
            Remove
          </button>
        </div>
      </div>
      <div className="text-right font-medium text-charcoal">{formatCurrency(item.unitPrice * item.quantity)}</div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          removeItem(item.variantId);
          setConfirmOpen(false);
        }}
        title="Remove item?"
        description={`Remove ${item.productName} from your cart?`}
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
