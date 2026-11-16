import { useEffect, useRef } from 'react';

/**
 * The top of every admin page: what this screen is, a way to search it, and the actions that
 * belong to the whole screen — on one line where there is room for it.
 *
 * Search sits here rather than down in the filter panel because on a list page it is the
 * thing reached for first; burying it under the summary tiles meant scrolling past the
 * numbers to get to it. It takes the slack between the title and the buttons, so the row
 * stays balanced whatever the title length.
 */
export default function PageHeader({ title, subtitle, search, actions }) {
  const inputRef = useRef(null);

  // Ctrl/Cmd+K is the shortcut people already expect for "search this page", and the hint in
  // the field is only honest if it actually works.
  useEffect(() => {
    if (!search) return undefined;
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [search]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-charcoal">{title}</h1>
        </div>

        {search && (
          <div className="relative order-last min-w-0 flex-1 basis-full sm:order-none sm:basis-56">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light">
              <SearchIcon />
            </span>
            <input
              ref={inputRef}
              type="search"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder}
              aria-label={search.placeholder}
              className="h-10 w-full rounded-lg border border-stone-300 pl-9 pr-16 text-sm text-charcoal placeholder:text-stone-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-stone-300 bg-stone-50 px-1.5 py-0.5 text-[10px] font-medium text-charcoal-light sm:block">
              Ctrl K
            </kbd>
          </div>
        )}

        {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {subtitle && <p className="text-[13px] text-charcoal-light">{subtitle}</p>}
    </div>
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
