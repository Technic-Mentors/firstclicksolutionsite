/**
 * The label above a form control.
 *
 * Shared by Input, Textarea and SearchableSelect so a required field is marked the same way
 * everywhere. The asterisk is hidden from screen readers — on its own it is just a symbol —
 * and the word "required" is announced instead.
 */
export default function FieldLabel({ htmlFor, required, children }) {
  if (!children) return null;

  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-charcoal-light">
      {children}
      {required && (
        <>
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      )}
    </label>
  );
}
