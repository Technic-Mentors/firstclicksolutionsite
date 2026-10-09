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
  const totalStock = Number(product.total_stock);
  const outOfStock = totalStock === 0;
  const lowStock = !outOfStock && totalStock > 0 && totalStock <= LOW_STOCK_THRESHOLD;
  const isWishlisted = onToggleWishlist ? isWishlistedOverride : has(product.id);
  const ratingCount = Number(product.rating_count) || 0;
  const ratingAvg = Number(product.rating_avg) || 0;

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

  function handleCartClick(e) {
    e.preventDefault();
    navigate(`/product/${product.slug}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="group relative"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative rounded-[22px] border border-charcoal/5 bg-white p-2 shadow-[0_18px_40px_rgba(28,25,23,0.07)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_54px_rgba(240,108,12,0.12)]">
          <div className="relative aspect-4/5 overflow-hidden rounded-[18px] bg-stone-100 ring-1 ring-charcoal/5">
            {product.primary_image ? (
              <img
                ref={imageRef}
                src={assetUrl(product.primary_image)}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-leaf-50 via-white to-gold-50">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-leaf-400/20 blur-2xl"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gold-400/20 blur-2xl"
                />
                <span className="relative text-gold-500/70 transition-transform duration-500 group-hover:scale-110">
                  <CategoryIcon slug={product.category_slug} className="h-14 w-14" strokeWidth={1.2} />
                </span>
                <span className="relative mt-2 px-3 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-charcoal-light/70">
                  {product.category_name || 'Photo coming soon'}
                </span>
              </div>
            )}

            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {outOfStock && (
              <span className="absolute left-2 top-2 rounded-full bg-charcoal/80 px-2.5 py-1 text-[11px] font-medium text-white">
                Out of stock
              </span>
            )}
            {compareAt && compareAt > price && !outOfStock && (
              <span className="absolute left-2 top-2 rounded-full bg-gold-500 px-2.5 py-1 text-[11px] font-medium text-white">
                Sale
              </span>
            )}
            {!outOfStock && (
              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
                <span className="rounded-full border border-white/50 bg-white/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-charcoal shadow-sm backdrop-blur-sm">
                  Ready to ship
                </span>
                <span className="rounded-full bg-leaf-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                  Tested
                </span>
              </div>
            )}

            <div className="absolute right-1.5 top-1.5 flex flex-col gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100 focus-within:opacity-100">
              <button
                onClick={handleWishlistClick}
                aria-label="Toggle wishlist"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm transition-colors hover:text-gold-600"
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
              {!outOfStock && (
                <button
                  onClick={handleCartClick}
                  aria-label="View and add to cart"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm transition-colors hover:text-gold-600"
                >
                  <CartIcon />
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <h3 className="truncate font-serif text-sm text-charcoal">{product.name}</h3>
            {compareAt && compareAt > price && (
              <span className="shrink-0 text-[11px] text-stone-400 line-through">{formatCurrency(compareAt)}</span>
            )}
          </div>
          {ratingCount > 0 && (
            <div className="mt-1 flex items-center gap-1.5">
              <Stars value={ratingAvg} size="sm" />
              <span className="text-[11px] text-stone-400">({ratingCount})</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-base font-semibold text-gold-700">{formatCurrency(price)}</span>
            {!outOfStock && <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-leaf-700">In stock</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 3.5 4 7.5C19 16.65 12 21 12 21z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 2.5h2l2.6 12.5a2 2 0 0 0 2 1.6h8a2 2 0 0 0 2-1.5l1.5-7H6" />
    </svg>
  );
}
