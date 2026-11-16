import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function Modal({ open, onClose, title, children, className }) {
  // Hold the page still while the dialog is up. Without this the wheel scrolls whatever is
  // behind the overlay, so closing the dialog leaves you somewhere you never meant to go.
  // Saving the previous value rather than clearing it keeps nesting correct: an inner dialog
  // restores the outer one's lock instead of releasing the page early.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-charcoal/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative z-10 flex w-full max-w-md max-h-[85vh] flex-col rounded-lg bg-white shadow-xl',
              className,
            )}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            {/* Pinned to the panel, not to the title row, so it sits in the same corner
                whether the dialog opens with a heading or with full-bleed artwork. The white
                disc and ring keep it readable on both. */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              title="Close"
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-charcoal-light shadow-sm ring-1 ring-black/5 transition-colors hover:bg-stone-100 hover:text-charcoal"
            >
              <CloseIcon />
            </button>

            {title && (
              <h3 className="shrink-0 border-b border-stone-100 px-6 pb-4 pr-14 pt-6 font-serif text-xl text-charcoal">
                {title}
              </h3>
            )}
            <div className="overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
