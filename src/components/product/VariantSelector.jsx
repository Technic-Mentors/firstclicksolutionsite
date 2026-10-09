import { useMemo, useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export default function VariantSelector({ variants = [], onChange }) {
  const specs = useMemo(() => [...new Set(variants.map((v) => v.spec))], [variants]);
  const grades = useMemo(() => [...new Set(variants.map((v) => v.condition_grade))], [variants]);

  const [spec, setSpec] = useState(specs[0] ?? null);
  const [grade, setGrade] = useState(grades[0] ?? null);

  const selected = useMemo(
    () => variants.find((v) => v.spec === spec && v.condition_grade === grade) ?? null,
    [variants, spec, grade],
  );

  useEffect(() => {
    onChange?.(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  function stockFor(candidateSpec, candidateGrade) {
    return (
      variants.find((v) => v.spec === candidateSpec && v.condition_grade === candidateGrade)?.stock_quantity ?? 0
    );
  }

  function handleSelectSpec(nextSpec) {
    setSpec(nextSpec);
    // Variant combinations aren't always a full grid (e.g. the 32GB build only comes
    // in Grade A) — if the current grade has no stock for this spec, jump to one that does.
    if (stockFor(nextSpec, grade) === 0) {
      const fallback = grades.find((g) => stockFor(nextSpec, g) > 0);
      if (fallback) setGrade(fallback);
    }
  }

  function handleSelectGrade(nextGrade) {
    setGrade(nextGrade);
    if (stockFor(spec, nextGrade) === 0) {
      const fallback = specs.find((s) => stockFor(s, nextGrade) > 0);
      if (fallback) setSpec(fallback);
    }
  }

  return (
    <div className="space-y-4">
      {specs.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-medium text-charcoal-light">Specification</p>
          <div className="flex flex-wrap gap-2">
            {specs.map((s) => {
              const disabled = variants.every((v) => v.spec !== s || v.stock_quantity === 0);
              return (
                <button
                  key={s}
                  disabled={disabled}
                  onClick={() => handleSelectSpec(s)}
                  className={cn(
                    'rounded-md border px-4 py-2 text-sm transition-colors',
                    s === spec ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-stone-300 text-charcoal',
                    disabled && 'cursor-not-allowed opacity-40 line-through',
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {grades.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-medium text-charcoal-light">Condition</p>
          <div className="flex flex-wrap gap-2">
            {grades.map((g) => {
              const disabled = variants.every((v) => v.condition_grade !== g || v.stock_quantity === 0);
              return (
                <button
                  key={g}
                  disabled={disabled}
                  onClick={() => handleSelectGrade(g)}
                  className={cn(
                    'rounded-md border px-4 py-2 text-sm transition-colors',
                    g === grade ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-stone-300 text-charcoal',
                    disabled && 'cursor-not-allowed opacity-40 line-through',
                  )}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selected && selected.stock_quantity > 0 && selected.stock_quantity <= 5 && (
        <p className="text-xs font-medium text-amber-600">Only {selected.stock_quantity} left in stock</p>
      )}
      {!selected && (specs.length > 1 || grades.length > 1) && (
        <p className="text-xs text-charcoal-light">Select a specification and condition to see availability.</p>
      )}
    </div>
  );
}
