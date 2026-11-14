import { Link } from 'react-router-dom';

const ACTIONS = [
  { to: '/admin/categories', label: 'Add category', icon: TagIcon },
  { to: '/admin/products/new', label: 'Add product', icon: PlusBoxIcon },
  { to: '/admin/coupons', label: 'Create offer', icon: PercentIcon },
  { to: '/admin/banners', label: 'New banner', icon: ImageIcon },
];

/** The four things most often started from a cold open, in catalogue-build order. */
export default function QuickActions() {
  return (
    <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-charcoal">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex items-center gap-2.5 rounded-lg border border-stone-200 px-3 py-2.5 text-sm font-medium text-charcoal transition-colors hover:border-gold-300 hover:bg-gold-50"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gold-50 text-gold-600">
              <action.icon />
            </span>
            <span className="truncate">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2H3v9l10.3 10.3a1 1 0 0 0 1.4 0l7.6-7.6a1 1 0 0 0 0-1.4L12 2Z" />
    </svg>
  );
}
function PlusBoxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function PercentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m19 5-14 14" />
      <circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 16-5-5-7 7" />
    </svg>
  );
}
