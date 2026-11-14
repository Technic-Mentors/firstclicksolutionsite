/**
 * The icon set for StatTiles.
 *
 * Shared rather than redefined per page so the same idea always wears the same glyph — a
 * clock means "waiting on you" on Orders and on Reviews alike, which is what lets an admin
 * read a tile row without reading every label.
 */
const BASE = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9 };

export function ListIcon() {
  return (
    <svg {...BASE}>
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeLinecap="round" />
    </svg>
  );
}
export function ClockIcon() {
  return (
    <svg {...BASE}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" />
    </svg>
  );
}
export function TruckIcon() {
  return (
    <svg {...BASE}>
      <path d="M3 16V6h11v10M14 9h4l3 3.5V16h-7" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}
export function CheckIcon() {
  return (
    <svg {...BASE} strokeWidth="2.2">
      <path d="m5 12 5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function CrossIcon() {
  return (
    <svg {...BASE} strokeWidth="2.2">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
export function UsersIcon() {
  return (
    <svg {...BASE}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.4a6.5 6.5 0 0 1 3.5 5.6" />
    </svg>
  );
}
export function BanIcon() {
  return (
    <svg {...BASE}>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.6 5.6 12.8 12.8" />
    </svg>
  );
}
export function StarIcon() {
  return (
    <svg {...BASE} strokeLinejoin="round">
      <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 3Z" />
    </svg>
  );
}
export function TicketIcon() {
  return (
    <svg {...BASE} strokeLinejoin="round">
      <path d="M3 8h18v3a2.5 2.5 0 0 0 0 5v3H3v-3a2.5 2.5 0 0 0 0-5V8Z" />
      <path d="M13 8v2M13 14v2" strokeLinecap="round" />
    </svg>
  );
}
export function FileIcon() {
  return (
    <svg {...BASE} strokeLinejoin="round">
      <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-6-6Z" />
      <path d="M13 3v6h6" />
    </svg>
  );
}
export function PencilIcon() {
  return (
    <svg {...BASE} strokeLinejoin="round">
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    </svg>
  );
}
export function ImageIcon() {
  return (
    <svg {...BASE}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m21 16-5-5-7 7" />
    </svg>
  );
}
export function MailIcon() {
  return (
    <svg {...BASE} strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
export function MailOpenIcon() {
  return (
    <svg {...BASE} strokeLinejoin="round">
      <path d="M3 10.5 12 4l9 6.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8.5Z" />
      <path d="m3 10.5 9 6 9-6" />
    </svg>
  );
}
export function PinIcon() {
  return (
    <svg {...BASE} strokeLinejoin="round">
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
export function CoinIcon() {
  return (
    <svg {...BASE}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5A2.5 2.5 0 0 0 12 8c-1.4 0-2.5.7-2.5 2s1.1 2 2.5 2 2.5.7 2.5 2-1.1 2-2.5 2a2.5 2.5 0 0 1-2.5-1.5M12 6.5v11" strokeLinecap="round" />
    </svg>
  );
}
export function LayersIcon() {
  return (
    <svg {...BASE} strokeLinejoin="round">
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
    </svg>
  );
}
export function AlertIcon() {
  return (
    <svg {...BASE}>
      <path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}
export function BoxIcon() {
  return (
    <svg {...BASE}>
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      <path d="M20 16.5v-9a2 2 0 0 0-1-1.7l-6-3.5a2 2 0 0 0-2 0l-6 3.5a2 2 0 0 0-1 1.7v9a2 2 0 0 0 1 1.7l6 3.5a2 2 0 0 0 2 0l6-3.5a2 2 0 0 0 1-1.7Z" />
    </svg>
  );
}
