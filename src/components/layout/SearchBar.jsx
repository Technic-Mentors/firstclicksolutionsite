import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getProducts } from '../../api/catalog.api';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/format';
import { cn } from '../../utils/cn';
import { assetUrl } from '../../utils/media';

export default function SearchBar({ inputClassName, iconClassName, placeholder = 'Search...', onNavigate }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 250);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const term = debounced.trim();
    if (!term) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    getProducts({ search: term, pageSize: 5 })
      .then((res) => {
        if (!cancelled) setSuggestions(res.data || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function goToSearchResults() {
    const term = query.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setQuery('');
    setOpen(false);
    onNavigate?.();
  }

  function goToProduct(product) {
    navigate(`/product/${product.slug}`);
    setQuery('');
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div ref={ref} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToSearchResults();
        }}
      >
        <div className="relative">
          <SearchIcon className={cn('pointer-events-none absolute top-1/2 -translate-y-1/2 text-stone-400', iconClassName)} />
          <input
            type="search"
            aria-label="Search products"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className={inputClassName}
          />
        </div>
      </form>

      <AnimatePresence>
        {open && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-30 mt-2 max-h-80 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg"
          >
            {suggestions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-charcoal-light">No matching products.</p>
            ) : (
              <>
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => goToProduct(p)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-stone-50"
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded bg-stone-100">
                      {p.primary_image && <img src={assetUrl(p.primary_image)} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-charcoal">{p.name}</span>
                    <span className="shrink-0 text-xs text-stone-400">{formatCurrency(p.min_price ?? p.base_price)}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={goToSearchResults}
                  className="block w-full border-t border-stone-100 px-3 py-2.5 text-center text-xs font-medium text-gold-600 hover:bg-stone-50"
                >
                  See all results for &ldquo;{query.trim()}&rdquo;
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
