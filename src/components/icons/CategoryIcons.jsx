/**
 * Line icons keyed to the catalogue's seven categories, plus a neutral fallback.
 *
 * Used by the home page category tiles and by the product-image placeholder, so a
 * product with no photo still shows something that tells you what it is rather than
 * a grey "No image" box.
 */

const PATHS = {
  'dual-screen-systems': (
    <>
      <rect x="1.5" y="4" width="9.5" height="7.5" rx="1.2" />
      <rect x="13" y="4" width="9.5" height="7.5" rx="1.2" />
      <path d="M6.25 11.5v2.5M3.75 14h5M17.75 11.5v2.5M15.25 14h5" />
      <path d="M2 19h20" />
    </>
  ),
  'gaming-pcs': (
    <>
      <path d="M6.5 8h11a4.5 4.5 0 0 1 4.4 3.6l.7 3.6A2.6 2.6 0 0 1 20 18.3a2.6 2.6 0 0 1-2.2-1.2L16.6 15H7.4l-1.2 2.1A2.6 2.6 0 0 1 4 18.3a2.6 2.6 0 0 1-2.6-3.1l.7-3.6A4.5 4.5 0 0 1 6.5 8Z" />
      <path d="M7 11v2.2M5.9 12.1h2.2" />
      <circle cx="16" cy="11.6" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13.2" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  laptops: (
    <>
      <rect x="4" y="4.5" width="16" height="11" rx="1.6" />
      <path d="M2 19h20M9.5 19l.6-1.5h3.8l.6 1.5" />
    </>
  ),
  'lcds-leds': (
    <>
      <rect x="2" y="3.5" width="20" height="13" rx="1.8" />
      <path d="M8.5 21h7M12 16.5V21" />
    </>
  ),
  'mini-computers': (
    <>
      <rect x="5" y="7.5" width="14" height="9" rx="2" />
      <circle cx="8.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M12 12h4" />
    </>
  ),
  'refurbished-computers': (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="1.8" />
      <path d="M9.5 6.5h5M9.5 9.5h5" />
      <circle cx="12" cy="16" r="2.2" />
    </>
  ),
  'sff-computers': (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="1.8" />
      <path d="M7 9.5h4M7 12.5h4" />
      <circle cx="16.5" cy="14.5" r="1.8" />
    </>
  ),
  fallback: (
    <>
      <rect x="2" y="3.5" width="20" height="13" rx="1.8" />
      <path d="M8 21h8M12 16.5V21" />
    </>
  ),
};

export function CategoryIcon({ slug, className = 'h-6 w-6', strokeWidth = 1.5 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[slug] || PATHS.fallback}
    </svg>
  );
}

export default CategoryIcon;
