import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

/**
 * The row-level "…" menu.
 *
 * Rendered through a portal with fixed positioning rather than as an absolutely positioned
 * child: every table here sits inside an `overflow-x-auto` wrapper, which would clip a
 * normally positioned dropdown to the scroll box. Fixed + portal escapes that, at the cost
 * of having to re-measure — hence the close-on-scroll below.
 *
 * `items` take { label, onClick | to, icon?, danger?, disabled? }. A `null` entry is skipped,
 * so callers can write conditional actions inline without filtering first.
 */
export default function ActionMenu({ items = [], label = 'Actions', align = 'right', buttonClassName }) {
  const visible = items.filter(Boolean);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 176;
    // Flip above when there is not enough room below, so the last row of a long table
    // does not open a menu that runs off the bottom of the window.
    const estimatedHeight = visible.length * 36 + 10;
    const openUp = rect.bottom + estimatedHeight > window.innerHeight && rect.top > estimatedHeight;

    setPosition({
      top: openUp ? rect.top - estimatedHeight - 4 : rect.bottom + 4,
      left: align === 'right' ? Math.max(8, rect.right - width) : rect.left,
      width,
    });
  }, [open, align, visible.length]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (menuRef.current?.contains(event.target) || triggerRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    // A fixed menu does not travel with the page, so rather than re-measure on every frame
    // it simply closes — which is also what a user scrolling away expects.
    const onScrollOrResize = () => setOpen(false);

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open]);

  if (visible.length === 0) return null;

  const itemClass = (item) =>
    cn(
      'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
      item.disabled && 'cursor-not-allowed opacity-50',
      !item.disabled && (item.danger ? 'text-red-600 hover:bg-red-50' : 'text-charcoal hover:bg-stone-100'),
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        // Rows are often clickable themselves; without this, opening the menu would also
        // navigate into the record behind it.
        onClick={(event) => {
          event.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-md text-charcoal-light transition-colors hover:bg-stone-100 hover:text-charcoal',
          open && 'bg-stone-100 text-charcoal',
          buttonClassName,
        )}
      >
        <DotsIcon />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            style={{ position: 'fixed', top: position.top, left: position.left, width: position.width }}
            className="z-50 overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            {visible.map((item, idx) =>
              item.to && !item.disabled ? (
                <Link key={idx} to={item.to} role="menuitem" className={itemClass(item)} onClick={() => setOpen(false)}>
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <button
                  key={idx}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  className={itemClass(item)}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}
