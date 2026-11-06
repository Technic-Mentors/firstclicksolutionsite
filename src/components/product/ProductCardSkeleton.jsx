export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-charcoal/10 bg-white p-2">
      <div className="aspect-[4/3] rounded-xl bg-stone-200" />
      <div className="mt-2 h-2.5 w-1/3 rounded bg-stone-200" />
      <div className="mt-1.5 h-3.5 w-4/5 rounded bg-stone-200" />
      <div className="mt-1.5 h-2.5 w-3/5 rounded bg-stone-200" />
      <div className="mt-3 flex items-center justify-between">
        <div className="h-4 w-1/4 rounded bg-stone-200" />
        <div className="h-6 w-14 rounded-full bg-stone-200" />
      </div>
    </div>
  );
}
