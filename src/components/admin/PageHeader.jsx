/**
 * The top of every admin page: what this screen is, one line on what it is for, and the
 * actions that belong to the whole screen.
 *
 * The subtitle is not decoration — it is the only place that says what a page actually
 * governs, which matters on screens like Categories where the effect is somewhere else
 * entirely (the storefront menu).
 */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-charcoal">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-charcoal-light">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
