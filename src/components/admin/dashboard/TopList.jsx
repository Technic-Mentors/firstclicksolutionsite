import { Link } from 'react-router-dom';

/**
 * A ranked list. When `getAmount` is supplied each row also gets a bar scaled against the
 * leader, which turns "who is top" into something you read at a glance instead of comparing
 * numbers. The number stays on the row — the bar is a second encoding, not a replacement.
 */
export default function TopList({
  title,
  items = [],
  renderLabel,
  renderValue,
  renderMeta,
  getAmount,
  viewAllTo,
  empty,
  emptyMessage = 'No data yet.',
}) {
  const max = getAmount ? Math.max(...items.map((item) => Number(getAmount(item)) || 0), 0) : 0;

  return (
    <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
        {viewAllTo && (
          <Link to={viewAllTo} className="text-xs font-medium text-gold-600 transition-colors hover:text-gold-700">
            See all
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        empty ?? <p className="py-6 text-center text-sm text-charcoal-light">{emptyMessage}</p>
      ) : (
        <ol className="flex flex-col gap-3.5">
          {items.map((item, idx) => {
            const amount = getAmount ? Number(getAmount(item)) || 0 : 0;
            const width = max > 0 ? Math.max((amount / max) * 100, 2) : 0;

            return (
              <li key={idx} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-charcoal-light">
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm text-charcoal">{renderLabel(item)}</span>
                    <span className="shrink-0 text-sm font-semibold text-charcoal">{renderValue(item)}</span>
                  </span>
                  {getAmount && (
                    <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <span className="block h-full rounded-full bg-gold-500" style={{ width: `${width}%` }} />
                    </span>
                  )}
                  {renderMeta && (
                    <span className="mt-1 block truncate text-[11px] text-charcoal-light">{renderMeta(item)}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
