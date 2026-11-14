import { cn } from '../../utils/cn';

/**
 * An on/off switch for a single setting.
 *
 * Always paired with a visible label by its caller — the knob's position is the only thing
 * colour adds here, and a switch whose state reads as colour alone is unusable for anyone
 * who cannot see the difference.
 */
export default function Toggle({ checked, onChange, disabled, label, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onChange?.(!checked);
      }}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-green-600' : 'bg-stone-300',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[1.1rem]' : 'translate-x-1',
        )}
      />
    </button>
  );
}
