import { useEffect, useMemo, useRef, useState } from 'react';
import FieldLabel from './FieldLabel';
import { cn } from '../../utils/cn';

/**
 * A searchable dropdown — behaves like a <select> (controlled value/onChange)
 * but lets the user filter options by typing. Use for any list of options
 * that could grow long (categories, etc).
 *
 * options: [{ value, label }]
 */
export default function SearchableSelect({
  label,
  required,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  error,
  className,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((opt) => String(opt.value) === String(value));

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(opt) {
    onChange?.(opt.value);
    setIsOpen(false);
    setQuery('');
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className={cn('relative', className)}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setIsOpen((v) => !v);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className={cn(
            'flex w-full items-center justify-between rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-left text-sm text-charcoal',
            'focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100',
            error && 'border-red-400',
            disabled && 'cursor-not-allowed bg-stone-100 opacity-60',
          )}
        >
          <span className={selected ? 'text-charcoal' : 'text-stone-400'}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronIcon open={isOpen} />
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-1 w-full rounded-md border border-stone-200 bg-white shadow-lg">
            <div className="border-b border-stone-100 p-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-md border border-stone-200 px-2.5 py-1.5 text-sm focus:border-gold-400 focus:outline-none"
              />
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-stone-400">No matches.</p>
              ) : (
                filtered.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm hover:bg-gold-50',
                      String(opt.value) === String(value) ? 'bg-gold-50 text-gold-700' : 'text-charcoal',
                    )}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('shrink-0 text-stone-400 transition-transform', open && 'rotate-180')}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
