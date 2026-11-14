export default function EmptyState({ art, icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {art}
      {!art && icon && <div className="text-4xl text-stone-300">{icon}</div>}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-charcoal">{title}</h3>
        {description && <p className="max-w-sm text-sm text-charcoal-light">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
