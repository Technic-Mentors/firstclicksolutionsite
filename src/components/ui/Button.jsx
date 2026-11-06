import { cn } from '../../utils/cn';
import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-charcoal text-cream hover:bg-charcoal-light disabled:bg-stone-300',
  forest: 'bg-forest-700 text-white hover:bg-forest-600 disabled:bg-forest-500',
  gold: 'bg-gold-500 text-white hover:bg-gold-600 disabled:bg-gold-200',
  outline: 'border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream disabled:opacity-40',
  ghost: 'text-charcoal hover:bg-stone-100 disabled:opacity-40',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-200',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-wide transition-colors duration-200 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner size="sm" light={variant === 'primary' || variant === 'forest' || variant === 'gold' || variant === 'danger'} />}
      {children}
    </button>
  );
}
