/**
 * Shared orange backdrop for interior page heroes. Add as the first child of a
 * relative, overflow-hidden section; its negative z-index keeps it behind content.
 */
export default function PageHeroBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-20 bg-gold-500"
      style={{
        backgroundImage:
          'radial-gradient(circle at 16% 16%, rgba(255,255,255,0.14), transparent 30%), radial-gradient(circle at 86% 100%, rgba(0,0,0,0.08), transparent 35%)',
      }}
    />
  );
}
