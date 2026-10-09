import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { getCategories } from '../../api/catalog.api';
import { getPublicSettings } from '../../api/settings.api';
import { STORE_MAP_EMBED_URL } from '../../config/mapLocation';
import { BRAND_NAME, STORE_PHONE, STORE_EMAIL, STORE_ADDRESS } from '../../config/site';

export default function Footer() {
  const { data: categories } = useAsync(() => getCategories(), []);
  const topCategories = (categories || []).filter((c) => !c.parent_id).slice(0, 4);
  const { data: settings } = useAsync(() => getPublicSettings(), []);

  return (
    <footer className="relative overflow-hidden border-t border-stone-200 bg-white text-charcoal">
      {/* Gold top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

      {/* Radial gold glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_60%)]" />

      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ══════════════ MAIN GRID ══════════════ */}
      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* ── Brand column ── */}
          <div className="lg:pr-4">
            <Link to="/" className="mb-2 inline-flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt={BRAND_NAME}
                className="h-20 w-44 transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <p className="text-xs leading-relaxed text-charcoal-light">
              Professionally refurbished desktops, laptops, gaming PCs and monitors — every machine tested,
              data-wiped and backed by a 12 month warranty. Supplied UK-wide from our Burnley workshop.
            </p>
          </div>

          {/* ── Shop links ── */}
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500">
              <span className="h-px w-3 bg-gold-500" />
              Shop
            </h4>
            <ul className="space-y-1 text-sm">
              <FooterLink to="/onlineshop">All Products</FooterLink>
              {topCategories.map((category) => (
                <FooterLink key={category.id} to={`/onlineshop?category=${category.slug}`}>
                  {category.name}
                </FooterLink>
              ))}
            </ul>

          </div>

          {/* ── Useful Links ── */}
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500">
              <span className="h-px w-3 bg-gold-500" />
              Useful Links
            </h4>
            <ul className="space-y-1 text-sm">
              <FooterLink to="/track-order">Track Order</FooterLink>
              <FooterLink to="/faq">FAQs</FooterLink>
              <FooterLink to="/size-guide">Buying Guide</FooterLink>
              <FooterLink to="/policy">Shipping &amp; Returns</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          {/* ── Reach Us ── */}
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500">
              <span className="h-px w-3 bg-gold-500" />
              Reach Us
            </h4>

            <div className="space-y-1.5">
              <p className="flex items-start gap-1.5 text-[11px] text-charcoal-light">
                <PinIconSmall />
                <span>{settings?.store_address || STORE_ADDRESS}</span>
              </p>
              <a
                href={`tel:${(settings?.store_phone || STORE_PHONE).replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 text-[11px] text-charcoal-light transition-colors hover:text-gold-600"
              >
                <PhoneIconSmall />
                <span>{settings?.store_phone || STORE_PHONE}</span>
              </a>
              <a
                href={`mailto:${settings?.store_email || STORE_EMAIL}`}
                className="flex items-center gap-1.5 text-[11px] text-charcoal-light transition-colors hover:text-gold-600"
              >
                <MailIconSmall />
                <span>{settings?.store_email || STORE_EMAIL}</span>
              </a>
            </div>

            {/* Small embedded map */}
            <div className="mt-2.5 overflow-hidden rounded-md border border-gold-500/15">
              <iframe
                title="Store location"
                src={STORE_MAP_EMBED_URL}
                width="100%"
                height="110"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block w-full"
              />
            </div>

        
          </div>
        </div>
      </div>

      {/* ══════════════ BOTTOM BAR ══════════════ */}
      <div className="relative border-t border-gold-500/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-2.5 text-[11px] text-charcoal-light sm:flex-row sm:px-6">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <p className="flex items-center justify-center gap-1 text-center">
            Developed with{' '}
            <HeartIcon className="inline-block h-2.5 w-2.5 text-red-500" filled /> by{' '}
            <a
              href="https://technicmentors.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-charcoal transition-colors hover:text-gold-600"
            >
              Technic Mentors
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════ Helpers ═══════════════ */
function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="group inline-flex items-center gap-1 text-charcoal-light transition-colors hover:text-gold-600"
      >
        <span className="h-px w-0 bg-gold-500 transition-all duration-300 group-hover:w-2.5" />
        {children}
      </Link>
    </li>
  );
}

/* ═══════════════ Icons ═══════════════ */
function HeartIcon({ className, filled }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 3.5 4 7.5C19 16.65 12 21 12 21z" />
    </svg>
  );
}

function PinIconSmall() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
      <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIconSmall() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6a2 2 0 0 1 1.8 2Z" />
    </svg>
  );
}

function MailIconSmall() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}