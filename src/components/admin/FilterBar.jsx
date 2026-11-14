import { cn } from '../../utils/cn';

/**
 * The search-and-filter panel that sits above a list.
 *
 * Everything in here wraps rather than scrolls. A filter row that sidescrolls hides its own
 * controls, which is the failure this layout exists to avoid — so chips and tabs are allowed
 * to run onto a second line instead of being pushed off the edge.
 */
export default function FilterBar({ search, tabs, chips, trailing }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4">
      {chips && <div className="flex flex-wrap gap-2">{chips}</div>}

      <div className="flex flex-wrap items-center gap-2">
        {search && (
          <div className="relative min-w-0 flex-1 basis-56">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder}
              aria-label={search.placeholder}
              className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-sm text-charcoal placeholder:text-stone-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
            />
          </div>
        )}
        {tabs && <div className="flex flex-wrap items-center gap-1">{tabs}</div>}
        {trailing}
      </div>
    </div>
  );
}

/** A count-carrying tab, for splitting a list by state (All / Visible / Hidden). */
export function FilterTab({ active, onClick, count, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-stone-100 text-charcoal' : 'text-charcoal-light hover:bg-stone-50 hover:text-charcoal',
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'rounded px-1.5 text-[11px] font-semibold',
            active ? 'bg-white text-charcoal-light' : 'bg-stone-100 text-charcoal-light',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/** A pill filter, for picking one value out of many (a category, a status). */
export function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-forest-600 bg-forest-600 text-white'
          : 'border-stone-300 text-charcoal-light hover:border-stone-400 hover:text-charcoal',
      )}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
