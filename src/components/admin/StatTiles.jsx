import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

/**
 * The row of headline counts under a page header.
 *
 * Tones carry meaning rather than variety: `primary` is the total this page is about, `good`
 * is a healthy state, `warning` and `danger` are things that want attention. A tile only
 * wears warning or danger when its number being high is actually a problem — otherwise the
 * row turns into a wall of alarm colour and none of it registers.
 *
 * `value` of `undefined` renders a dash, so tiles hold their shape while counts load instead
 * of flashing zeros that read as real.
 */
const TONES = {
  primary: 'bg-forest-600 text-white',
  good: 'bg-green-50 text-green-700',
  accent: 'bg-gold-50 text-gold-600',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-600',
  neutral: 'bg-stone-100 text-charcoal-light',
};

export default function StatTiles({ tiles = [] }) {
  if (tiles.length === 0) return null;

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3',
        tiles.length >= 5 ? 'xl:grid-cols-5' : 'lg:grid-cols-4',
      )}
    >
      {tiles.map((tile) => {
        const body = (
          <>
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TONES[tile.tone] ?? TONES.neutral)}>
              {tile.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold leading-tight text-charcoal">
                {tile.value ?? '–'}
              </span>
              <span className="block truncate text-xs text-charcoal-light">{tile.label}</span>
            </span>
          </>
        );

        const className = cn(
          'flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3.5',
          tile.to && 'transition-colors hover:border-stone-300 hover:bg-stone-50',
        );

        return tile.to ? (
          <Link key={tile.key} to={tile.to} className={className}>
            {body}
          </Link>
        ) : (
          <div key={tile.key} className={className}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
