import { Link } from 'react-router-dom';
import { bucketOrderStatuses } from './statusPalette';
import DashboardEmpty, { WaitingForOrdersArt } from './DashboardEmpty';

/**
 * Where every order currently sits, as one stacked bar plus a legend.
 *
 * The legend is not optional decoration: it is what names each colour, so the card is still
 * readable without colour vision. Each row also carries the count and share in text.
 */
export default function OrderStatusCard({ counts }) {
  const { buckets, total } = bucketOrderStatuses(counts);

  return (
    <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-charcoal">Order Status</h3>
        <span className="text-xs text-charcoal-light">{total} total</span>
      </div>

      {total === 0 ? (
        <DashboardEmpty
          art={<WaitingForOrdersArt />}
          title="Waiting for the first order"
          description="Once orders start coming in, this shows how many are at each stage."
          actionLabel="Check shipping setup"
          actionTo="/admin/shipping"
        />
      ) : (
        <>
          {/* 2px gaps let the surface show between segments, so neighbouring colours never
              touch — the boundary stays visible even when two of them look similar. */}
          <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
            {buckets.map((bucket) => (
              <span
                key={bucket.key}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{ width: `${(bucket.count / total) * 100}%`, backgroundColor: bucket.color }}
                title={`${bucket.label}: ${bucket.count}`}
              />
            ))}
          </div>

          <ul className="mt-5 flex flex-col gap-3">
            {buckets.map((bucket) => (
              <li key={bucket.key} className="flex items-center gap-2.5 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: bucket.color }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate text-charcoal-light">{bucket.label}</span>
                <span className="shrink-0 font-semibold text-charcoal">{bucket.count}</span>
                <span className="w-9 shrink-0 text-right text-xs text-charcoal-light">
                  {Math.round((bucket.count / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <Link
        to="/admin/orders"
        className="mt-5 text-xs font-medium text-gold-600 transition-colors hover:text-gold-700"
      >
        Manage orders &rarr;
      </Link>
    </div>
  );
}
