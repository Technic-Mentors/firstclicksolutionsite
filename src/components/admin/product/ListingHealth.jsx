import { cn } from '../../../utils/cn';

/**
 * What still needs doing before this listing is worth publishing.
 *
 * The distinction that matters here is between a check that is merely unfinished and one
 * that actively stops the product selling — a missing description is a gap, a missing price
 * means nobody can buy it. The second kind is marked `blocking` and wears the warning
 * colour; everything else stays quiet so the warning still means something.
 *
 * Each item names the step that fixes it, so the card is a way into the form rather than
 * just a scoreboard.
 */
export default function ListingHealth({ checks = [], onGoToStep }) {
  const done = checks.filter((c) => c.done).length;
  const total = checks.length;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-charcoal">Listing health</h3>
        <span className="text-xs text-charcoal-light">
          {done} of {total} done
        </span>
      </div>

      <div className="mb-3 flex gap-1">
        {checks.map((check) => (
          <span
            key={check.key}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              check.done ? 'bg-green-600' : check.blocking ? 'bg-amber-500' : 'bg-stone-200',
            )}
          />
        ))}
      </div>

      <ul className="flex flex-col">
        {checks.map((check) => (
          <li key={check.key}>
            <button
              type="button"
              onClick={() => onGoToStep?.(check.step)}
              className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-stone-50"
            >
              <span className="shrink-0">
                {check.done ? (
                  <TickIcon className="text-green-600" />
                ) : check.blocking ? (
                  <AlertIcon className="text-amber-500" />
                ) : (
                  <CircleIcon className="text-stone-300" />
                )}
              </span>
              <span className={cn('flex-1 truncate text-xs', check.done ? 'text-charcoal-light' : 'text-charcoal')}>
                {check.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TickIcon({ className }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m5 12 5 5L19 7" />
    </svg>
  );
}
function AlertIcon({ className }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16.5h.01" strokeLinecap="round" />
    </svg>
  );
}
function CircleIcon({ className }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
