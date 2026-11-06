import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/format';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useFlyToStore } from '../../store/useFlyToStore';
import { getIconTargetRect } from '../../utils/iconTargets';
import { assetUrl } from '../../utils/media';
import Stars from '../ui/Stars';
import { CategoryIcon } from '../icons/CategoryIcons';

const LOW_STOCK_THRESHOLD = 5;

/* The one-line spec under the name. meta_description is written for exactly this,
   so it wins; the long description is the fallback, clamped to two lines. */
function specLine(product) {
  const raw = product.meta_description || product.description || '';
  return raw.replace(/\s+/g, ' ').trim();
}

export default function ProductCard({ product, onToggleWishlist, isWishlisted: isWishlistedOverride }) {
  const navigate = useNavigate();
  const customer = useAuthStore((s) => s.customer);
  const { has, toggle, load, loaded } = useWishlistStore();
  const launchFlyTo = useFlyToStore((s) => s.launch);
  const imageRef = useRef(null);

  useEffect(() => {
    if (customer && !loaded && !onToggleWishlist) load();
  }, [customer, loaded, onToggleWishlist, load]);

  const price = Number(product.min_price ?? product.base_price);
  const compareAt = product.compare_at_price ? Number(product.compare_at_price) : null;
  const onSale = compareAt && compareAt > price;
  const totalStock = Number(product.total_stock);
  const outOfStock = totalStock === 0;
  const lowStock = !outOfStock && totalStock > 0 && totalStock <= LOW_STOCK_THRESHOLD;
  const isWishlisted = onToggleWishlist ? isWishlistedOverride : has(product.id);
  const ratingCount = Number(product.rating_count) || 0;
  const ratingAvg = Number(product.rating_avg) || 0;
  const spec = specLine(product);

  async function handleWishlistClick(e) {
    e.preventDefault();
    if (onToggleWishlist) return onToggleWishlist(product);
    if (!customer) {
      toast.error('Please log in to use your wishlist.');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    try {
      if (!isWishlisted && product.primary_image) {
        const fromRect = imageRef.current?.getBoundingClientRect();
        const toRect = getIconTargetRect('wishlist');
        if (fromRect && toRect) {
          launchFlyTo({ imageUrl: assetUrl(product.primary_image), fromRect, toRect, target: 'wishlist' });
        }
      }
      await toggle(product);
    } catch {
      toast.error('Something went wrong.');
    }
  }

  // Variants are picked on the product page, so Add takes you there rather than
  // guessing which one to drop in the basket.
  function handleAddClick(e) {
    e.preventDefault();
    navigate(`/product/${product.slug}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      className="group relative h-full"
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex h-full flex-col rounded-xl border border-charcoal/10 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/45 hover:shadow-[0_14px_30px_rgba(240,108,12,0.16)] sm:p-2.5"
      >
        <div className="relative overflow-hidden rounded-lg bg-white ring-1 ring-charcoal/5">
          <div className="flex aspect-[4/3] items-center justify-center p-1">
            {product.primary_image ? (
              <img
                ref={imageRef}
                src={assetUrl(product.primary_image)}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="flex flex-col items-center text-forest-600/30">
                <CategoryIcon slug={product.category_slug} className="h-12 w-12" strokeWidth={1.2} />
                <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-charcoal-light/70">
                  {product.category_name || 'Photo coming soon'}
                </span>
              </span>
            )}
          </div>

          {outOfStock ? (
            <span className="absolute left-1 top-1 rounded-full bg-charcoal/85 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">
              Out of stock
            </span>
          ) : (
            onSale && (
              <span className="absolute left-1 top-1 rounded-full bg-gold-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-[0_3px_10px_rgba(240,108,12,0.35)]">
                Save {formatCurrency(compareAt - price)}
              </span>
            )
          )}

          <button
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm ring-1 ring-charcoal/5 transition-colors hover:bg-gold-50 hover:text-gold-600"
          >
            <motion.span
              key={isWishlisted}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="flex"
            >
              <HeartIcon filled={isWishlisted} />
            </motion.span>
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-charcoal-light/70 sm:text-[10px]">
            {product.category_name || 'Refurbished'}
          </span>
          {outOfStock ? (
            <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.08em] text-stone-400 sm:text-[10px]">
              Sold out
            </span>
          ) : (
            <span
              className={`flex shrink-0 items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] sm:text-[10px] ${
                lowStock ? 'text-gold-600' : 'text-leaf-700'
              }`}
            >
              <i className={`h-1 w-1 rounded-full ${lowStock ? 'bg-gold-500' : 'bg-leaf-500'}`} />
              {lowStock ? `Only ${totalStock} left` : 'In stock'}
            </span>
          )}
        </div>

        <h3 className="mt-1 line-clamp-2 text-[0.84rem] font-bold leading-[1.25] text-forest-600 transition-colors group-hover:text-gold-600 sm:text-sm">
          {product.name}
        </h3>

        {spec && <p className="mt-1 line-clamp-2 text-[0.72rem] leading-[1.35] text-charcoal-light sm:text-xs">{spec}</p>}

        {ratingCount > 0 && (
          <div className="mt-0.5 flex items-center gap-1">
            <Stars value={ratingAvg} size="sm" />
              <span className="text-[10px] text-stone-400">({ratingCount})</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <span className="flex items-baseline gap-1">
            <span className="text-base font-bold leading-none text-charcoal sm:text-lg">{formatCurrency(price)}</span>
            {onSale && (
              <span className="text-[10px] text-stone-400 line-through">{formatCurrency(compareAt)}</span>
            )}
          </span>
          <button
            onClick={handleAddClick}
            disabled={outOfStock}
            className="flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(240,108,12,0.3)] transition-all hover:bg-gold-600 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
          >
            <PlusIcon />
            Add
          </button>
        </div>
      </Link>
    </motion.div>
  );
}

function PlusIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 3.5 4 7.5C19 16.65 12 21 12 21z" />
    </svg>
  );
}
