// Single source of truth for brand/backend wiring — vite.config.js and src/api/client.js
// both read from this file instead of duplicating these values.

// --- First Click Solutions (active) ---
export const BRAND_NAME = 'First Click Solutions';
export const DEV_BACKEND_PORT = 3009;
export const DEV_FRONTEND_PORT = 5174;
export const PROD_API_URL = 'https://backend.buraqstudyadvisor.com';

// Customer-facing contact details — kept here so the header, footer, contact page
// and home page all read the same values.
export const STORE_PHONE = '01282 421306';
export const STORE_PHONE_HREF = 'tel:+441282421306';
export const STORE_PHONE_SECONDARY = '+44 7809 672020';
export const STORE_PHONE_SECONDARY_HREF = 'tel:+447809672020';
export const STORE_EMAIL = 'info@firstclicksolutions.co.uk';
export const STORE_EMAIL_HREF = 'mailto:info@firstclicksolutions.co.uk';
export const STORE_ADDRESS_LINES = [
  'Bay 5 & 6, Unit 1B',
  'Balderstone Lane',
  'Burnley, BB10 2TS',
];
export const STORE_ADDRESS = STORE_ADDRESS_LINES.join(', ');
export const STORE_MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=Unit+1B+Balderstone+Lane+Burnley+BB10+2TS';

// Social accounts — the header strip and footer both read this list.
export const SOCIAL_LINKS = [
  { name: 'Facebook', href: 'https://www.facebook.com/FirstClickSolutionsLtd' },
  { name: 'Instagram', href: 'https://www.instagram.com/firstclicksolutionsltd/' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/first-click-solutions-ltd/' },
];
