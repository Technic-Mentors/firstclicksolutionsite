import { cn } from '../../utils/cn';

const PAGE_SIZES = [10, 20, 50, 100];

/**
 * The footer under a table: how many rows to show, which ones you are looking at, and how to
 * move between pages.
 *
 * Shown even when everything fits on one page — the range ("1–11 of 11") is the only place
 * that says how much there is in total, and hiding it exactly when the answer is "not much"
 * leaves the table looking truncated. Only the page buttons disable themselves.
 *
 * `itemLabel` names what is being counted, so each page reads in its own words — "Products
 * per page", "Orders per page" — instead of a generic "Records".
 */
export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'rows',
}) {
  if (!total && !totalPages) return null;

  const pages = Math.max(totalPages || 1, 1);
  const from = total === 0 ? 0 : (page - 1) * (pageSize || 0) + 1;
  const to = pageSize ? Math.min(page * pageSize, total) : total;

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-3 border-t border-stone-200 px-4 py-3">
      {onPageSizeChange && pageSize && (
        <label className="flex items-center gap-2 text-xs text-charcoal-light">
          <span className="first-letter:uppercase">{itemLabel} per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label={`${itemLabel} per page`}
            className="h-8 rounded-lg border border-stone-300 bg-white pl-2.5 pr-7 text-xs font-medium text-charcoal focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}

      <span className="text-xs text-charcoal-light">
        {total === 0 ? `No ${itemLabel}` : `${from} – ${to} of ${total}`}
      </span>

      <div className="flex items-center gap-1">
        <PageButton label="First page" disabled={page <= 1} onClick={() => onPageChange(1)}>
          <DoubleChevron />
        </PageButton>
        <PageButton label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <Chevron />
        </PageButton>

        {pageNumbers(page, pages).map((entry, idx) =>
          entry === 'gap' ? (
            <span key={`gap-${idx}`} className="px-1 text-xs text-charcoal-light">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? 'page' : undefined}
              className={cn(
                'h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition-colors',
                entry === page
                  ? 'bg-forest-600 text-white'
                  : 'text-charcoal-light hover:bg-stone-100 hover:text-charcoal',
              )}
            >
              {entry}
            </button>
          ),
        )}

        <PageButton label="Next page" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          <Chevron className="rotate-180" />
        </PageButton>
        <PageButton label="Last page" disabled={page >= pages} onClick={() => onPageChange(pages)}>
          <DoubleChevron className="rotate-180" />
        </PageButton>
      </div>
    </div>
  );
}

/**
 * Up to seven slots: the first and last page always stay reachable, the current page keeps a
 * neighbour on each side, and anything skipped collapses into an ellipsis. Without the
 * windowing, a hundred-page list would draw a hundred buttons.
 */
function pageNumbers(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  const result = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);

  if (start > 2) result.push('gap');
  for (let i = start; i <= end; i += 1) result.push(i);
  if (end < pages - 1) result.push('gap');
  result.push(pages);
  return result;
}

function PageButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-light transition-colors hover:bg-stone-100 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function Chevron({ className }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m14 6-6 6 6 6" />
    </svg>
  );
}
function DoubleChevron({ className }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m17 6-6 6 6 6M11 6l-6 6 6 6" />
    </svg>
  );
}
