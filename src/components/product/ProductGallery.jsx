import { forwardRef, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { assetUrl } from '../../utils/media';

/**
 * The product's images: one large frame with hover-zoom, a thumbnail rail beside it on
 * desktop and under it on smaller screens, swipe on touch, and a full-screen viewer.
 *
 * Hover-zoom only exists for a mouse, so touch gets its own ways through the set — a swipe,
 * dots under the frame, and a tap into the full-screen viewer where the image is finally
 * large enough to inspect.
 */
const ProductGallery = forwardRef(function ProductGallery({ images = [], alt = 'Product', badge = null }, ref) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const [viewerOpen, setViewerOpen] = useState(false);
  const touchStartX = useRef(null);
  const active = images[activeIndex];

  const hasMany = images.length > 1;

  function step(delta) {
    setActiveIndex((i) => (i + delta + images.length) % images.length);
  }

  // Arrow keys and Escape work while the full-screen viewer is open; closing it also lets
  // the page scroll again.
  useEffect(() => {
    if (!viewerOpen) return undefined;
    function handleKey(e) {
      if (e.key === 'Escape') setViewerOpen(false);
      if (e.key === 'ArrowRight' && hasMany) step(1);
      if (e.key === 'ArrowLeft' && hasMany) step(-1);
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerOpen, hasMany, images.length]);

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-xl bg-white ring-1 ring-gold-500/15" />;
  }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current == null || !hasMany) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(delta) > 45) step(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-3">
      {/* Desktop rail. The same thumbnails run under the frame on narrow screens, where a
          vertical rail would eat the width the image needs. */}
      {hasMany && (
        <div className="order-2 hidden max-h-130 shrink-0 flex-col gap-2 overflow-y-auto lg:order-1 lg:flex">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-label={`View ${alt} image ${i + 1}`}
              aria-current={i === activeIndex}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors',
                i === activeIndex ? 'border-gold-500' : 'border-stone-200 hover:border-gold-500/40',
              )}
            >
              <img src={assetUrl(img.image_path)} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      <div className="order-1 min-w-0 flex-1 lg:order-2">
        <div
          ref={ref}
          role="button"
          tabIndex={0}
          aria-label="Open image full screen"
          onClick={() => setViewerOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setViewerOpen(true);
            }
          }}
          className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-gold-500/15"
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={active.id}
              src={assetUrl(active.image_path)}
              alt={`${alt}, image ${activeIndex + 1}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ transformOrigin: zoomOrigin }}
              className={cn(
                'h-full w-full object-contain p-4 transition-transform duration-200 ease-out',
                zooming && 'scale-[2.2]',
              )}
            />
          </AnimatePresence>

          {/* The saving, called out on the image itself — the one thing a shopper looks for
              before anything else on a refurbished machine. */}
          {badge && (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-gold-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
              {badge}
            </span>
          )}

          <span className="pointer-events-none absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-charcoal opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            <ExpandIcon />
          </span>

          {hasMany && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white hover:text-gold-600"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white hover:text-gold-600"
              >
                <ChevronIcon direction="right" />
              </button>
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-charcoal/70 px-2.5 py-1 text-[11px] font-medium text-white">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          )}
        </div>

        {/* Dots for touch, where the thumbnail rail is below the fold of the frame. */}
        {hasMany && (
          <div className="mt-2 flex justify-center gap-1.5 lg:hidden">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === activeIndex ? 'w-5 bg-gold-500' : 'w-1.5 bg-stone-300',
                )}
              />
            ))}
          </div>
        )}

        {hasMany && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                aria-label={`View ${alt} image ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white transition-colors',
                  i === activeIndex ? 'border-gold-500' : 'border-transparent hover:border-gold-500/40',
                )}
              >
                <img src={assetUrl(img.image_path)} alt="" className="h-full w-full object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setViewerOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} image viewer`}
          >
            <button
              type="button"
              aria-label="Close image viewer"
              onClick={() => setViewerOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <CloseIcon />
            </button>

            <motion.img
              key={active.id}
              src={assetUrl(active.image_path)}
              alt={`${alt}, image ${activeIndex + 1}`}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="max-h-[85vh] max-w-full object-contain"
            />

            {hasMany && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                >
                  <ChevronIcon direction="right" />
                </button>
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ProductGallery;

function ChevronIcon({ direction = 'right' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={cn(direction === 'left' ? 'rotate-90' : '-rotate-90')}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
