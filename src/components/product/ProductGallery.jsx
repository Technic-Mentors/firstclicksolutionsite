import { forwardRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { assetUrl } from '../../utils/media';

const ProductGallery = forwardRef(function ProductGallery({ images = [], alt = 'Product' }, ref) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const active = images[activeIndex];

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-md bg-white" />;
  }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  return (
    <div>
      <div
        ref={ref}
        className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-gold-500/15"
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
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

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white hover:text-gold-600"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setActiveIndex((activeIndex + 1) % images.length)}
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
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
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
