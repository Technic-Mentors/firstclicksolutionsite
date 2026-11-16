import { Link } from 'react-router-dom';
import DashboardArt from './DashboardArt';

const PROMISES = ['Live stock tracking', 'Orders and reviews', 'Storefront control'];

/**
 * The split screen every signed-out admin page sits in: brand on the left, the form on the
 * right.
 *
 * Shared so sign-in, "forgot password" and "set a new password" are visibly the same place.
 * Someone arriving from a reset email has already been bounced between an inbox and a
 * browser; landing on a page that looks unrelated is where people start wondering whether
 * the link was genuine.
 */
export default function AuthShell({ badge, title, subtitle, children, footer }) {
  return (
    // h-screen, not min-h-screen: this page should never scroll the window. Each side then
    // manages its own height — the brand panel shrinks to fit, and only the form scrolls,
    // and only when a short phone leaves it no room.
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Hidden below lg: on a phone it would push the form off the first screen, and the
          form is the only thing anyone comes here to do. */}
      <div className="relative hidden w-[55%] flex-col overflow-hidden bg-forest-700 p-6 text-white lg:flex xl:p-10">
        {/* No wordmark beside it: the logo already reads "First Click Solutions", so the text
            was saying it twice and taking the room the logo needed. The panel shrink-wraps
            the logo rather than being square, because the logo is twice as wide as it is
            tall and a square box left empty white on both sides. */}
        <Link to="/" className="shrink-0 self-start">
          <span className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3.5 shadow-lg">
            <img src="/logo.png" alt="First Click Solutions" className="h-12 w-auto object-contain xl:h-14" />
          </span>
        </Link>

        {/* Art before the words: it is the first thing the eye lands on. `min-h-0 flex-1`
            gives it whatever height is left over and lets the SVG scale into it, so a short
            laptop screen shrinks the picture instead of pushing the page into a scrollbar. */}
        <div className="flex min-h-0 flex-1 items-center justify-center py-4">
          <DashboardArt className="h-full max-h-[260px] w-full max-w-[400px]" />
        </div>

        <div className="shrink-0">
          <h2 className="text-3xl font-semibold leading-tight xl:text-4xl">
            Your whole store,
            <br />
            one click away.
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">
            Products, stock, orders and reviews in a single dashboard built for First Click.
          </p>
        </div>

        <ul className="mt-5 flex shrink-0 flex-wrap gap-2">
          {PROMISES.map((promise) => (
            <li
              key={promise}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium"
            >
              <TickIcon />
              {promise}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex w-full flex-col overflow-y-auto bg-forest-700 lg:w-[45%] lg:bg-cream-dark">
        {/* Phone and tablet only. The brand panel beside it is hidden at this width, and
            without this the admin signs in on a bare cream page with a stamp-sized logo —
            no sense of whose product this is. The same green, logo and headline run across
            the top instead, and the form sheet lifts over it. */}
        <div className="shrink-0 px-6 pb-14 pt-9 text-white lg:hidden">
          <span className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 shadow-lg">
            <img src="/logo.png" alt="First Click Solutions" className="h-11 w-auto object-contain" />
          </span>

          <h2 className="mt-6 text-2xl font-semibold leading-tight">
            Your whole store,
            <br />
            one click away.
          </h2>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {PROMISES.map((promise) => (
              <li
                key={promise}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium"
              >
                <TickIcon />
                {promise}
              </li>
            ))}
          </ul>
        </div>

        {/* m-auto rather than items-center: when the form is taller than the screen, centring
            would clip its top beyond reach, while auto margins give way and let it scroll. */}
        <div className="-mt-8 flex flex-1 rounded-t-3xl bg-cream-dark px-5 pb-10 pt-8 lg:mt-0 lg:rounded-none lg:px-5 lg:py-8">
          <div className="m-auto w-full max-w-sm">
            {badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-2.5 py-1 text-[11px] font-semibold text-gold-700">
                <LockIcon />
                {badge}
              </span>
            )}

            <h1 className="mt-3 text-2xl font-semibold text-charcoal">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-charcoal-light">{subtitle}</p>}

            {children}

            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}

function TickIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a3d244" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L19 7" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
