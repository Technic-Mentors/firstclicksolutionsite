import { formatCurrency } from '../../../utils/format';

/**
 * A rough rendering of how the product will read on the storefront, updating as the form is
 * typed into.
 *
 * Deliberately approximate, and labelled as a preview rather than dressed up as the real
 * card: it is here to catch a name that runs too long or a product with no price, not to be
 * a pixel-accurate copy of the shop that would then quietly drift out of date.
 */
export default function ProductPreview({ name, categoryName, brand, price, variants = [], imageUrl, isActive }) {
  const hasPrice = Number(price) > 0;
  const chips = variants.filter((v) => v.spec || v.conditionGrade).slice(0, 3);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-charcoal">How shoppers see it</h3>
        <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-700">
          Live preview
        </span>
      </div>

      <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
        <div className="relative mb-3 flex h-32 items-center justify-center overflow-hidden rounded-md border border-stone-200 bg-white">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[11px] uppercase tracking-wide text-stone-400">No image yet</span>
          )}
          {!isActive && (
            <span className="absolute left-2 top-2 rounded bg-charcoal px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Draft
            </span>
          )}
        </div>

        {brand && <p className="text-[11px] uppercase tracking-wide text-charcoal-light">{brand}</p>}
        <p className="mt-0.5 text-sm font-semibold leading-snug text-charcoal">
          {name || <span className="text-stone-400">Product name</span>}
        </p>
        {categoryName && <p className="mt-0.5 text-[11px] text-charcoal-light">{categoryName}</p>}

        {chips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {chips.map((v, idx) => (
              <span key={idx} className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-charcoal-light ring-1 ring-stone-200">
                {[v.spec, v.conditionGrade].filter(Boolean).join(' · ')}
              </span>
            ))}
          </div>
        )}

        {/* No "Add to cart" here on purpose. It would be permanently disabled, says nothing
            about the product being edited, and the one thing it did signal — that this
            cannot be bought yet — the line below states outright. */}
        <p className={`mt-3 text-lg font-semibold ${hasPrice ? 'text-gold-600' : 'text-stone-400'}`}>
          {hasPrice ? formatCurrency(price) : 'No price yet'}
        </p>
        {!hasPrice && (
          <p className="mt-1 text-[11px] text-amber-700">Shoppers cannot buy this until it has a price.</p>
        )}
      </div>
    </div>
  );
}
