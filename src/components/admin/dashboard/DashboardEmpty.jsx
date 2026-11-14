import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';

// Re-exported so the dashboard's own imports stay a single line.
export {
  WaitingForOrdersArt,
  NoSalesArt,
  NoRankingArt,
  AllClearArt,
} from '../../ui/emptyArt';

/**
 * The empty state for a dashboard card.
 *
 * Two rules it exists to enforce:
 *  - the card keeps its height, so one quiet card does not leave a hole in the grid;
 *  - the text says *why* it is empty and what fills it, because "No data" tells an admin
 *    nothing about whether something is broken or simply hasn't happened yet.
 *
 * The art is line work in neutral ink with a single warm accent. It is decoration, so it is
 * hidden from screen readers — the heading below carries the meaning.
 */
export default function DashboardEmpty({ art, title, description, actionLabel, actionTo, className }) {
  return (
    <div className={cn('flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center', className)}>
      {art}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-charcoal">{title}</p>
        {description && <p className="max-w-[16rem] text-xs leading-relaxed text-charcoal-light">{description}</p>}
      </div>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-1 rounded-md border border-stone-300 px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-gold-400 hover:bg-gold-50 hover:text-gold-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
