import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAsync } from '../hooks/useAsync';
import { getProductBySlug, getProducts } from '../api/catalog.api';
import { getProductReviews } from '../api/reviews.api';
import { notifyMe } from '../api/notifyMe.api';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useRecentlyViewedStore } from '../store/useRecentlyViewedStore';
import { useFlyToStore } from '../store/useFlyToStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { getIconTargetRect } from '../utils/iconTargets';
import { assetUrl } from '../utils/media';
import { cn } from '../utils/cn';
import { getErrorMessage } from '../utils/errorMessage';
import ProductGallery from '../components/product/ProductGallery';
import VariantSelector from '../components/product/VariantSelector';
import ReviewList from '../components/product/ReviewList';
import ProductCard from '../components/product/ProductCard';
import RecentlyViewed from '../components/product/RecentlyViewed';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { TruckIcon, ReturnIcon, BadgeIcon, LockIcon } from '../components/icons/TrustIcons';
import { formatCurrency } from '../utils/format';
import { BRAND_NAME, STORE_WHATSAPP_HREF } from '../config/site.js';

export default function ProductPage() {
  const { slug } = useParams();
  const customer = useAuthStore((s) => s.customer);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addProduct);
  const launchFlyTo = useFlyToStore((s) => s.launch);
  const { has: hasWishlisted, toggle: toggleWishlist, load: loadWishlist, loaded: wishlistLoaded } = useWishlistStore();
  const galleryRef = useRef(null);
  const justAddedTimeoutRef = useRef(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [tabKey, setTabKey] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyBoxRef = useRef(null);

  const { data: product, loading, error, refetch } = useAsync(() => getProductBySlug(slug), [slug]);
  const { data: reviewData } = useAsync(
    () => (product ? getProductReviews(product.id) : Promise.resolve(null)),
    [product?.id],
  );
  const { data: related } = useAsync(
    () => (product ? getProducts({ category: product.category_slug, pageSize: 4 }) : Promise.resolve(null)),
    [product?.category_slug],
  );

  useEffect(() => {
    if (customer && !wishlistLoaded) loadWishlist();
  }, [customer, wishlistLoaded, loadWishlist]);

  const isWishlisted = product ? hasWishlisted(product.id) : false;

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?.id]);

  useEffect(() => {
    return () => clearTimeout(justAddedTimeoutRef.current);
  }, []);

  // The bar at the foot of the window is only worth the space it covers once the real Add to
  // Cart button has scrolled out of sight, so it follows the buy box rather than the scroll
  // position. It stays out of the way while the button is still reachable.
  useEffect(() => {
    const node = buyBoxRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [product]);

  useEffect(() => {
    if (!product) return;
    addRecentlyViewed({
      id: product.id,
      slug: product.slug,
      name: product.name,
      base_price: product.base_price,
      compare_at_price: product.compare_at_price,
      primary_image: product.images?.[0]?.image_path,
      total_stock: (product.variants || []).reduce((sum, v) => sum + v.stock_quantity, 0),
    });
  }, [product, addRecentlyViewed]);

  // The SEO step of the product form was writing meta_title / meta_description into the
  // database and nothing was reading them back. They belong to the tab and the search
  // snippet rather than the page body, and fall back to the product's own name.
  useEffect(() => {
    if (!product) return undefined;
    const previousTitle = document.title;
    document.title = product.meta_title || `${product.name} | ${BRAND_NAME}`;

    let tag = document.querySelector('meta[name="description"]');
    const createdTag = !tag;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    const previousDescription = tag.getAttribute('content');
    tag.setAttribute('content', product.meta_description || product.description || product.name);

    return () => {
      document.title = previousTitle;
      if (createdTag) tag.remove();
      else if (previousDescription != null) tag.setAttribute('content', previousDescription);
    };
  }, [product]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (error || !product) {
    return <ErrorState message="Product not found." onRetry={refetch} />;
  }

  const price = selectedVariant?.price_override ?? product.base_price;
  const allOutOfStock = product.variants.every((v) => v.stock_quantity === 0);
  const discountPercent =
    product.compare_at_price && Number(product.compare_at_price) > Number(price)
      ? Math.round((1 - Number(price) / Number(product.compare_at_price)) * 100)
      : 0;
  const savingAmount =
    discountPercent > 0 ? Number(product.compare_at_price) - Number(price) : 0;
  const productHelpHref = `${STORE_WHATSAPP_HREF}?text=${encodeURIComponent(`Hi, I have a question about ${product.name}.`)}`;

  // Everything the admin fills in on the product form, in the order the form asks for it,
  // so what is entered in the admin is what the shopper reads back here. Anything left
  // blank simply drops out rather than printing an empty row.
  const detailRows = [
    { label: 'Brand', value: product.fabric },
    { label: 'Category', value: product.category_name },
    { label: 'Specification', value: selectedVariant?.spec },
    { label: 'Condition', value: selectedVariant?.condition_grade },
    { label: 'Material / build', value: product.material },
    { label: 'SKU', value: selectedVariant?.sku },
    {
      label: 'Availability',
      value: selectedVariant
        ? selectedVariant.stock_quantity > 0
          ? `In stock (${selectedVariant.stock_quantity})`
          : 'Out of stock'
        : null,
    },
  ].filter((row) => row.value);

  const infoTabs = [
    detailRows.length > 0 ? { key: 'specs', label: 'Specifications' } : null,
    product.description ? { key: 'description', label: 'Description' } : null,
    product.care_instructions ? { key: 'condition', label: "Condition & what's included" } : null,
  ].filter(Boolean);
  // A tab that was open on the last product may not exist on this one, so the first tab
  // stands in rather than the panel going blank.
  const activeTab = infoTabs.find((tab) => tab.key === tabKey) || infoTabs[0] || null;

  const alreadyInCart = selectedVariant
    ? cartItems.find((item) => item.variantId === selectedVariant.id)?.quantity ?? 0
    : 0;
  const remainingStock = selectedVariant ? Math.max(0, selectedVariant.stock_quantity - alreadyInCart) : 0;

  async function handleAddToCart() {
    if (!selectedVariant || remainingStock <= 0) return;
    try {
      const fromRect = galleryRef.current?.getBoundingClientRect();
      const toRect = getIconTargetRect('cart');
      const imagePath = product.images?.[0]?.image_path;
      if (fromRect && toRect && imagePath) {
        launchFlyTo({ imageUrl: assetUrl(imagePath), fromRect, toRect, target: 'cart' });
      }
      await addItem(
        {
          variantId: selectedVariant.id,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          spec: selectedVariant.spec,
          conditionGrade: selectedVariant.condition_grade,
          unitPrice: Number(selectedVariant.price_override ?? product.base_price),
          primaryImage: product.images?.[0]?.image_path,
          stockQuantity: selectedVariant.stock_quantity,
        },
        quantity,
      );
      toast.success('Added to cart');
      setJustAdded(true);
      clearTimeout(justAddedTimeoutRef.current);
      justAddedTimeoutRef.current = setTimeout(() => setJustAdded(false), 1400);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not add to cart.'));
    }
  }

  async function handleWishlistToggle() {
    if (!customer) return toast.error('Please log in to use your wishlist.');
    try {
      if (!isWishlisted) {
        const fromRect = galleryRef.current?.getBoundingClientRect();
        const toRect = getIconTargetRect('wishlist');
        const imagePath = product.images?.[0]?.image_path;
        if (fromRect && toRect && imagePath) {
          launchFlyTo({ imageUrl: assetUrl(imagePath), fromRect, toRect, target: 'wishlist' });
        }
      }
      await toggleWishlist(product);
    } catch {
      toast.error('Something went wrong.');
    }
  }

  function handleShareOnWhatsApp() {
    const message = `Check out ${product.name} on ${BRAND_NAME}: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  async function handleNotifyMe(e) {
    e.preventDefault();
    if (!selectedVariant) return;
    try {
      await notifyMe({ variantId: selectedVariant.id, email: notifyEmail });
      toast.success("We'll email you when it's back in stock.");
      setNotifyEmail('');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong.'));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-charcoal-light">
        <Link to="/" className="hover:text-gold-600">Home</Link>
        <span className="text-stone-300">/</span>
        <Link to={`/onlineshop?category=${product.category_slug}`} className="hover:text-gold-600">{product.category_name}</Link>
        <span className="text-stone-300">/</span>
        <span className="font-medium text-charcoal">{product.name}</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid items-start gap-6 md:grid-cols-2 lg:gap-10"
      >
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery
            ref={galleryRef}
            images={product.images}
            alt={product.name}
            badge={discountPercent > 0 ? `Save ${discountPercent}%` : null}
          />
        </div>

        <div className="rounded-xl border border-gold-500/15 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">{product.category_name}</span>
            <StockBadge allOutOfStock={allOutOfStock} variant={selectedVariant} />
            <button
              type="button"
              onClick={handleShareOnWhatsApp}
              aria-label="Share this product on WhatsApp"
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-emerald-600 transition-colors hover:bg-emerald-50"
            >
              <WhatsAppShareIcon />
            </button>
          </div>
          <h1 className="mt-2 font-serif text-2xl leading-tight text-charcoal sm:text-[2rem]">{product.name}</h1>
          {/* The price sits in its own tinted card rather than as another line of text: it is
              the first thing looked for, and on a refurbished machine the saving beside it is
              the second. */}
          <div className="mt-3 rounded-xl border border-gold-500/20 bg-linear-to-br from-gold-50 to-white p-3.5 sm:p-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-semibold leading-none text-gold-700 sm:text-[2.1rem]">
                {formatCurrency(price)}
              </span>
              {product.compare_at_price && (
                <span className="text-sm text-stone-400 line-through">{formatCurrency(product.compare_at_price)}</span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                <SavingIcon />
                You save {formatCurrency(savingAmount)} ({discountPercent}%)
              </span>
            )}
          </div>

          <div className="mt-6 border-t border-stone-100 pt-5">
            <VariantSelector variants={product.variants} onChange={setSelectedVariant} />
          </div>

          <div ref={buyBoxRef} aria-hidden="true" className="h-px w-full" />

          {allOutOfStock ? (
            <form onSubmit={handleNotifyMe} className="mt-6 space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm font-medium text-charcoal">This item is out of stock</p>
              <p className="-mt-1 text-xs text-charcoal-light">
                Leave your email and we&rsquo;ll let you know the moment it&rsquo;s back.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  required
                  placeholder="Your email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">Notify Me</Button>
              </div>
            </form>
          ) : (
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex w-fit items-center gap-1 rounded-full border border-gold-500/30 px-1">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-charcoal-light transition-colors hover:bg-gold-50 hover:text-gold-700"
                  >
                    −
                  </button>
                  <span className="min-w-[1.5rem] text-center text-sm font-medium text-charcoal">{quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(remainingStock, q + 1))}
                    disabled={quantity >= remainingStock}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-charcoal-light transition-colors hover:bg-gold-50 hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-1 gap-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || remainingStock <= 0}
                    className="min-h-12 flex-1 overflow-hidden"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {justAdded ? (
                        <motion.span
                          key="added"
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-2"
                        >
                          <motion.span
                            initial={{ x: -28, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                          >
                            <MiniCartIcon />
                          </motion.span>
                          Added to Cart
                        </motion.span>
                      ) : (
                        <motion.span
                          key="default"
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          transition={{ duration: 0.2 }}
                        >
                          Add to Cart
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleWishlistToggle}
                    aria-pressed={isWishlisted}
                    className="min-h-12 shrink-0 overflow-hidden"
                  >
                    <motion.span
                      key={isWishlisted}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span>{isWishlisted ? '♥' : '♡'}</span>
                      {isWishlisted ? 'Saved' : 'Wishlist'}
                    </motion.span>
                  </Button>
                </div>
              </div>
              {selectedVariant && remainingStock <= 0 ? (
                <p className="text-xs font-medium text-amber-700">
                  You already have all {selectedVariant.stock_quantity} in stock in your cart.
                </p>
              ) : alreadyInCart > 0 ? (
                <p className="text-xs text-charcoal-light">{alreadyInCart} already in your cart.</p>
              ) : null}
            </div>
          )}

          <a
            href={productHelpHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#e9f8ef] px-3 py-2 text-center text-sm font-medium text-[#167a3d] transition-colors hover:bg-[#d9f2e3]"
          >
            <WhatsAppShareIcon />
            Questions about this machine? Chat with us
          </a>

          <div className="mt-5 grid grid-cols-2 gap-2.5 rounded-xl border border-gold-500/15 bg-gold-50/40 p-3 sm:mt-6 sm:grid-cols-4 sm:gap-3 sm:p-4">
            <TrustPoint icon={<TruckIcon />} label="UK Delivery" />
            <TrustPoint icon={<ReturnIcon />} label="14 Day Returns" />
            <TrustPoint icon={<BadgeIcon />} label="12 Month Warranty" />
            <TrustPoint icon={<LockIcon />} label="Secure Checkout" />
          </div>

          {/* Stacked, these three ran the page on well past the fold. As tabs the whole of
              what is known about the machine sits in one screen, and nothing is buried. */}
          {infoTabs.length > 0 && (
            <div className="mt-8 border-t border-stone-100 pt-6">
              <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-stone-100/80 p-1">
                {infoTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setTabKey(tab.key)}
                    aria-selected={activeTab?.key === tab.key}
                    className={cn(
                      'shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors',
                      activeTab?.key === tab.key
                        ? 'bg-white text-charcoal shadow-sm'
                        : 'text-charcoal-light hover:text-charcoal',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab?.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="mt-4 text-sm leading-relaxed text-charcoal-light"
                >
                  {activeTab?.key === 'description' && (
                    <p className="whitespace-pre-line">{product.description}</p>
                  )}

                  {activeTab?.key === 'specs' && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {detailRows.map((row) => (
                        <div
                          key={row.label}
                          className="flex items-start gap-2.5 rounded-lg border border-stone-200 bg-white px-3 py-2.5 transition-colors hover:border-gold-500/30"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gold-50 text-gold-600">
                            <SpecIcon label={row.label} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10.5px] uppercase tracking-wide text-stone-400">{row.label}</p>
                            <p className="wrap-break-word text-[13px] font-medium text-charcoal">{row.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab?.key === 'condition' && <p className="whitespace-pre-line">{product.care_instructions}</p>}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {reviewData && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mt-16 border-t border-gold-500/15 pt-10"
        >
          <h2 className="mb-6 font-serif text-2xl text-charcoal">Customer Reviews</h2>
          <ReviewList reviews={reviewData.reviews} summary={reviewData.summary} />
        </motion.div>
      )}

      {related?.data?.filter((p) => p.id !== product.id).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mt-16 border-t border-gold-500/15 pt-10"
        >
          <h2 className="mb-6 font-serif text-2xl text-charcoal">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.data
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </motion.div>
      )}

      <RecentlyViewed excludeId={product.id} />

      {/* Follows the page once the real buy box is above the fold: the picture to confirm
          which machine this is, the live price, and the one button worth having here. */}
      <AnimatePresence>
        {showStickyBar && !allOutOfStock && (
          <motion.div
            initial={{ y: 72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 72, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur sm:px-6"
          >
            <div className="mx-auto flex max-w-5xl items-center gap-3">
              {product.images?.[0]?.image_path && (
                <img
                  src={assetUrl(product.images[0].image_path)}
                  alt=""
                  className="hidden h-11 w-11 shrink-0 rounded-md object-contain ring-1 ring-stone-200 sm:block"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-charcoal">{product.name}</p>
                <p className="flex items-baseline gap-2 text-sm font-semibold text-gold-700">
                  {formatCurrency(price)}
                  {selectedVariant?.spec && (
                    <span className="truncate text-[11px] font-normal text-charcoal-light">
                      {selectedVariant.spec}
                    </span>
                  )}
                </p>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant || remainingStock <= 0}
                className="min-h-11 shrink-0 px-5"
              >
                {remainingStock <= 0 ? 'No stock left' : 'Add to Cart'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * One glyph per specification row, matched on the row's own label so the grid reads at a
 * glance instead of as a wall of text. An unknown label falls back to a plain dot.
 */
function SpecIcon({ label = '' }) {
  const props = {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (label) {
    case 'Brand':
      return (
        <svg {...props}>
          <path d="M20.6 13.4 12.8 21.2a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1-.6-1.4V4a1 1 0 0 1 1-1h8.8a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8Z" />
          <circle cx="7.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'Category':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'Specification':
      return (
        <svg {...props}>
          <rect x="7" y="7" width="10" height="10" rx="1.5" />
          <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
        </svg>
      );
    case 'Condition':
      return (
        <svg {...props}>
          <path d="M12 3 4.5 6v5.5c0 4.3 3.2 7.6 7.5 9.5 4.3-1.9 7.5-5.2 7.5-9.5V6L12 3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'Material / build':
      return (
        <svg {...props}>
          <path d="m12 2 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
        </svg>
      );
    case 'SKU':
      return (
        <svg {...props}>
          <path d="M4 5v14M7.5 5v14M11 5v14M14.5 5v14M18 5v14M20.5 5v14" />
        </svg>
      );
    case 'Availability':
      return (
        <svg {...props}>
          <path d="M21 8.5 12 13 3 8.5 12 4l9 4.5Z" />
          <path d="M3 8.5v7L12 20l9-4.5v-7M12 13v7" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      );
  }
}

function SavingIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function StockBadge({ allOutOfStock, variant }) {
  if (allOutOfStock) {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-600">
        Out of stock
      </span>
    );
  }
  if (variant && variant.stock_quantity > 0 && variant.stock_quantity <= 5) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
        Only {variant.stock_quantity} left
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
      In stock
    </span>
  );
}

function TrustPoint({ icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-gold-600 shadow-sm">
        {icon}
      </span>
      <span className="text-[11px] font-medium leading-tight text-charcoal-light sm:text-xs">{label}</span>
    </div>
  );
}

function MiniCartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 2.5h2l2.6 12.5a2 2 0 0 0 2 1.6h8a2 2 0 0 0 2-1.5l1.5-7H6" />
    </svg>
  );
}

function WhatsAppShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
      <path d="M16.001 3C9.376 3 4 8.376 4 15c0 2.378.694 4.59 1.885 6.45L4 29l7.76-1.832A11.94 11.94 0 0 0 16 27c6.624 0 12-5.376 12-12S22.625 3 16.001 3zm0 21.75a9.68 9.68 0 0 1-4.94-1.352l-.354-.21-4.605 1.087 1.115-4.486-.23-.368A9.7 9.7 0 0 1 6.25 15c0-5.376 4.375-9.75 9.75-9.75 5.376 0 9.75 4.374 9.75 9.75 0 5.376-4.374 9.75-9.75 9.75zm5.35-7.296c-.294-.147-1.737-.857-2.006-.954-.27-.098-.466-.147-.662.147-.196.294-.759.954-.93 1.15-.173.196-.343.22-.637.074-.294-.147-1.243-.458-2.367-1.46-.875-.78-1.465-1.744-1.637-2.038-.172-.294-.018-.453.128-.6.13-.13.294-.343.44-.515.147-.171.196-.294.294-.49.098-.196.049-.368-.024-.515-.074-.147-.662-1.598-.908-2.188-.238-.574-.48-.497-.662-.506l-.564-.01c-.196 0-.514.073-.784.367-.27.294-1.029 1.006-1.029 2.452s1.054 2.844 1.2 3.04c.147.196 2.073 3.166 5.023 4.44.702.302 1.25.482 1.677.617.705.223 1.347.191 1.855.116.566-.084 1.737-.71 1.983-1.396.245-.687.245-1.276.172-1.396-.074-.122-.27-.196-.564-.343z" />
    </svg>
  );
}
