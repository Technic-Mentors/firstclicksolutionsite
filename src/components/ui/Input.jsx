import { forwardRef, useState } from 'react';
import { cn } from '../../utils/cn';
import FieldLabel from './FieldLabel';

const Input = forwardRef(function Input({ label, error, className, id, type, required, ...props }, ref) {
  const inputId = id || props.name;
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={inputId} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          required={required}
          type={isPassword ? (visible ? 'text' : 'password') : type}
          className={cn(
            'w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder:text-stone-400',
            'focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
            isPassword && 'pr-10',
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-400 hover:text-charcoal-light"
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Input;

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17.9 17.9A11 11 0 0 1 12 19c-7 0-11-7-11-7a19.4 19.4 0 0 1 4.2-5.2M9.9 4.2A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a19.4 19.4 0 0 1-2.2 3M14.1 14.1a3 3 0 1 1-4.2-4.2" />
      <path d="M1 1l22 22" />
    </svg>
  );
}
