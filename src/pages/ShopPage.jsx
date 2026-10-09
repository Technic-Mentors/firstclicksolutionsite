import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useDebounce } from '../hooks/useDebounce';
import { getProducts, getCategories, getPriceRange } from '../api/catalog.api';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import PriceRangeSlider from '../components/ui/PriceRangeSlider';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { cn } from '../utils/cn';

const PRICE_MIN = 0;
const FALLBACK_PRICE_MAX = 10000;

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const slug = searchParams.get('category') || '';
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState([PRICE_MIN, FALLBACK_PRICE_MAX]);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: priceBounds } = useAsync(() => getPriceRange(slug || undefined), [slug]);
  const priceMax = priceBounds
    ? Math.max(10, Math.ceil(priceBounds.maxPrice / 10) * 10)
    : FALLBACK_PRICE_MAX;

  useEffect(() => {
    if (priceBounds) setPriceRange([PRICE_MIN, priceMax]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceBounds]);

  useEffect(() => {
    setPage(1);
  }, [slug]);

  const debouncedRange = useDebounce(priceRange, 300);

  const { data: categories } = useAsync(() => getCategories(), []);
  const { data, loading, error, refetch } = useAsync(
    () =>
      getProducts({
        category: slug || undefined,
        sort,
        minPrice: debouncedRange[0] > PRICE_MIN ? debouncedRange[0] : undefined,
        maxPrice: debouncedRange[1] < priceMax ? debouncedRange[1] : undefined,
        page,
        pageSize: 15,
      }),
    [slug, sort, debouncedRange, page],
  );

  const current = categories?.find((c) => c.slug === slug);
  const topCategories = categories?.filter((c) => !c.parent_id) || [];

  function selectCategory(nextSlug) {
    if (nextSlug) setSearchParams({ category: nextSlug });
    else setSearchParams({});
  }

  function clearFilters() {
    setPriceRange([PRICE_MIN, priceMax]);
    setSort('newest');
    setPage(1);
  }

  const hasActiveFilters = priceRange[0] > PRICE_MIN || priceRange[1] < priceMax || sort !== 'newest';

  return (
    <div>
      {/* Shop hero uses the same orange as the site header. */}
      <section className="relative isolate overflow-hidden bg-gold-500 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_85%_100%,rgba(0,0,0,0.08),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-20">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/75">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span className="text-white/50">/</span>
            <span className="font-medium text-white">{current?.name || 'Shop'}</span>
          </nav>

          {/* Eyebrow */}
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/70" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85">
              Shop the Collection
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/70" />
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl capitalize leading-tight text-white sm:text-5xl lg:text-6xl">
            {current?.name || 'Shop'}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/85 sm:text-base">
            Premium gear crafted with care — thoughtfully engineered for training, competition, and everyday performance.
          </p>

          {/* Underline */}
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="relative flex items-center gap-2 rounded-md border border-gold-500/30 bg-white px-3.5 py-2 text-sm font-medium text-charcoal shadow-sm transition-colors hover:border-gold-500/60 hover:bg-gold-50 lg:hidden"
          >
            <FilterIcon className="h-4 w-4 text-gold-600" /> Filters
            {hasActiveFilters && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-gold-500" />
            )}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside
            className={cn(
              'flex-col overflow-hidden rounded-xl border border-gold-500/15 bg-white shadow-sm lg:sticky lg:top-16 lg:h-fit',
              filtersOpen ? 'flex' : 'hidden lg:flex',
            )}
          >
            <div className="h-1 w-full bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300" />

            <div className="flex flex-col p-4">
              <h2 className="mb-4 flex items-center gap-2 font-serif text-lg text-charcoal">
                <FilterIcon className="h-4 w-4 text-gold-600" />
                Product Filters
              </h2>

              {/* Sort */}
              <div className="border-b border-stone-100 pb-4">
                <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal">Sort By</h3>
                <Select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="w-full">
                  <option value="newest">Default (Newest)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A-Z</option>
                </Select>
              </div>

              {/* ── Category Filter ── */}
              <div className="border-b border-stone-100 py-4">
                <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Category
                </h3>
                <div className="space-y-1">
                  <FilterRadio label="All" checked={!slug} onClick={() => selectCategory('')} />
                  {topCategories.map((cat) => (
                    <FilterRadio
                      key={cat.id}
                      label={cat.name}
                      checked={cat.slug === slug}
                      onClick={() => selectCategory(cat.slug)}
                    />
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="py-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-charcoal">Price</h3>
                <PriceRangeSlider
                  min={PRICE_MIN}
                  max={priceMax}
                  value={priceRange}
                  onChangeEnd={(lo, hi) => { setPriceRange([lo, hi]); setPage(1); }}
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-1 flex items-center gap-1.5 self-start text-sm font-medium text-gold-600 hover:text-gold-700"
                >
                  <ClearIcon className="h-3.5 w-3.5" />
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between border-b border-gold-500/15 pb-3">
              <p className="text-sm text-charcoal-light">
                {loading ? 'Loading...' : `${data?.meta?.total ?? 0} product${data?.meta?.total === 1 ? '' : 's'}`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <ErrorState message="Could not load products." onRetry={refetch} />
            ) : !data?.data?.length ? (
              <EmptyState title="No products found" description="Try adjusting your filters." />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {data.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {data.meta.totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-3">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <span className="flex items-center text-sm text-charcoal-light">
                      Page {data.meta.page} of {data.meta.totalPages}
                    </span>
                    <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Filter Radio ═══════════════ */
function FilterRadio({ label, checked, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
        checked ? 'bg-gold-50 text-gold-700' : 'text-charcoal-light hover:bg-stone-50',
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          checked ? 'border-gold-500' : 'border-stone-300',
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-gold-500" />}
      </span>
      <span className={checked ? 'font-medium' : ''}>{label}</span>
    </button>
  );
}

function FilterIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function ClearIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
