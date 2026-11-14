import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

/**
 * A stat tile: one headline number, how it moved, and a sparkline for shape.
 *
 * The direction of change is carried by the arrow and the signed percentage, not by colour
 * alone — the green/red tint is a reinforcement, so the card still reads correctly for a
 * colourblind viewer or in print.
 */
export default function StatCard({
  label,
  value,
  changePercent,
  comparison,
  icon,
  trend,
  highlight = false,
  to,
  delay = 0,
  className,
}) {
  const hasChange = changePercent !== undefined && changePercent !== null;
  const positive = hasChange && changePercent >= 0;

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-charcoal-light">{label}</span>
        {icon && (
          <span
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
              highlight ? 'bg-gold-500 text-white' : 'bg-stone-100 text-charcoal-light',
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <span className="block text-[26px] font-semibold leading-tight text-charcoal">{value}</span>

      <div className="mt-auto flex items-end justify-between gap-3">
        <span className="flex min-w-0 flex-col gap-0.5">
          {hasChange && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold',
                positive ? 'text-green-700' : 'text-red-600',
              )}
            >
              <ArrowIcon up={positive} />
              {positive ? '+' : ''}
              {Number(changePercent).toFixed(1)}%
            </span>
          )}
          {comparison && <span className="truncate text-[11px] text-charcoal-light">{comparison}</span>}
        </span>
        {trend?.length > 1 && <Sparkline points={trend} />}
      </div>
    </>
  );

  const cardClass = cn(
    'flex h-full flex-col gap-2 rounded-xl border p-4 shadow-sm transition-shadow',
    highlight ? 'border-gold-300 bg-gold-50' : 'border-stone-200 bg-white',
    to && 'hover:shadow-md',
    className,
  );

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full"
      {...(to ? { whileHover: { y: -3 }, whileTap: { scale: 0.99 } } : {})}
    >
      {to ? (
        <Link to={to} className={cn('block h-full', cardClass)}>
          {content}
        </Link>
      ) : (
        <div className={cardClass}>{content}</div>
      )}
    </motion.div>
  );

  return card;
}

function ArrowIcon({ up }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {up ? <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" /> : <path d="M6 2v8M2.5 6.5 6 10l3.5-3.5" />}
    </svg>
  );
}

/**
 * Decorative shape only — the number above it carries the value, so it has no axes, no
 * labels and is hidden from assistive technology.
 */
function Sparkline({ points, width = 72, height = 26 }) {
  const values = points.map((p) => Number(p) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);

  const coords = values.map((v, i) => [i * step, height - ((v - min) / span) * (height - 4) - 2]);
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden="true" className="shrink-0">
      <path d={area} fill="#f06c0c" fillOpacity="0.1" />
      <path d={line} stroke="#f06c0c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
