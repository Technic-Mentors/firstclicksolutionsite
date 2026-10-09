import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore, cartItemCount } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useFlyToStore } from '../../store/useFlyToStore';
import { useAsync } from '../../hooks/useAsync';
import { getCategories } from '../../api/catalog.api';
import { cn } from '../../utils/cn';
import { registerIconTarget } from '../../utils/iconTargets';
import CustomerNotificationBell from './CustomerNotificationBell';
import SearchBar from './SearchBar';
import {
  BRAND_NAME,
  STORE_PHONE,
  STORE_PHONE_HREF,
  STORE_PHONE_SECONDARY,
  STORE_PHONE_SECONDARY_HREF,
  STORE_EMAIL,
  STORE_EMAIL_HREF,
  SOCIAL_LINKS,
} from '../../config/site';

const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/benefits', label: 'Benefits' },
  { to: '/offers', label: 'Offers' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

const Header = React.forwardRef(function Header(_, ref) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuTop, setMobileMenuTop] = useState(0);
  const headerElementRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const customer = useAuthStore((s) => s.customer);
  const items = useCartStore((s) => s.items);
  const count = cartItemCount(items);
  const cartBump = useFlyToStore((s) => s.bumps.cart);
  const wishlistCount = useWishlistStore((s) => s.productIds.size);
  const wishlistLoaded = useWishlistStore((s) => s.loaded);
  const wishlistBump = useFlyToStore((s) => s.bumps.wishlist);

  const { data: categories } = useAsync(() => getCategories(), []);
  const topCategories = (categories || []).filter((c) => !c.parent_id);
  const subcategoriesOf = (id) =>
    (categories || []).filter((c) => c.parent_id === id);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    function updateMenuTop() {
      if (headerElementRef.current) {
        setMobileMenuTop(headerElementRef.current.getBoundingClientRect().bottom);
      }
    }

    updateMenuTop();
    window.addEventListener('resize', updateMenuTop);

    function handleOutsidePointer(event) {
      if (!mobileMenuRef.current?.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => {
      window.removeEventListener('resize', updateMenuTop);
      document.removeEventListener('pointerdown', handleOutsidePointer);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (customer && !wishlistLoaded) {
      useWishlistStore.getState().load();
    }
  }, [customer, wishlistLoaded]);

  return (
    <header
      ref={(node) => {
        headerElementRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur md:bg-cream/95"
    >
      {/* ══════════════ TOP ANNOUNCEMENT STRIP ══════════════ */}
      {/* Solid orange band in the logo's accent, white text throughout, carrying the
          social accounts on the left and both contact numbers on the right. */}
      <div className="bg-gold-500 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2 sm:px-6">
          {/* Left: social accounts */}
          <div className="flex items-center gap-1.5">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={social.name}
                title={social.name}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gold-600 shadow-sm transition-transform duration-200 hover:scale-110 hover:text-gold-700"
              >
                <SocialIcon name={social.name} className="h-[1.1rem] w-[1.1rem]" />
              </a>
            ))}
            <span className="ml-1.5 hidden text-[11px] font-medium tracking-wide text-white/90 sm:inline sm:text-xs">
              Welcome to <span className="font-semibold text-white">{BRAND_NAME}</span>
            </span>
          </div>

          {/* Right: both contact numbers + email */}
          <div className="flex items-center gap-x-3 gap-y-1">
            <a
              href={STORE_PHONE_HREF}
              className="text-[11px] font-semibold text-white transition-opacity hover:opacity-80 sm:text-xs"
            >
              {STORE_PHONE}
            </a>
            <span className="text-white/40" aria-hidden="true">|</span>
            <a
              href={STORE_PHONE_SECONDARY_HREF}
              className="text-[11px] font-semibold text-white transition-opacity hover:opacity-80 sm:text-xs"
            >
              {STORE_PHONE_SECONDARY}
            </a>
            <a
              href={STORE_EMAIL_HREF}
              className="hidden text-[11px] font-medium text-white/90 transition-opacity hover:opacity-80 md:inline md:text-xs"
            >
              {STORE_EMAIL}
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════ MAIN HEADER ══════════════ */}
      {/* Equal-width side columns on wide screens keep the nav group (Home · Categories · …)
          centred relative to the page instead of centred inside the leftover middle space. */}
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2.5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex shrink-0 items-center gap-2.5">
          {!mobileSearchOpen && (
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt={BRAND_NAME} className="h-12 w-auto sm:h-16" />
            </Link>
          )}
        </div>

        <div className="min-w-0">
          {mobileSearchOpen ? (
            <div className="md:hidden">
              <SearchBar
                placeholder="Search..."
                iconClassName="left-2.5"
                inputClassName="w-full rounded-full border border-stone-300 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-gold-400 focus:outline-none"
                onNavigate={() => setMobileSearchOpen(false)}
              />
            </div>
          ) : (
            <nav className="hidden items-center justify-center gap-6 md:flex">
              <NavLink
                to="/"
                end
                className={({ isActive }) => navLinkClass(isActive)}
              >
                Home
              </NavLink>

              <NavLink
                to="/onlineshop"
                className={({ isActive }) => navLinkClass(isActive)}
              >
                Shop
              </NavLink>

              <CategoriesDropdown
                topCategories={topCategories}
                subcategoriesOf={subcategoriesOf}
              />

              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="hidden lg:block lg:w-44 xl:w-56">
            <SearchBar
              placeholder="Search..."
              iconClassName="left-2.5"
              inputClassName="w-full rounded-full border border-stone-300 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-gold-400 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label={mobileSearchOpen ? 'Close search' : 'Search'}
            className="flex h-[19px] w-[19px] shrink-0 items-center justify-center text-charcoal-light hover:text-gold-600 lg:hidden"
          >
            {mobileSearchOpen ? <CloseIcon /> : <SearchIcon />}
          </button>

          {!mobileSearchOpen && (
            <>
              <div className="flex items-center gap-3.5">
                {customer && <CustomerNotificationBell />}

                <Link
                  to={customer ? '/account/wishlist' : '/login'}
                  aria-label="Wishlist"
                  ref={(el) => registerIconTarget('wishlist', el)}
                  className="relative flex h-[19px] w-[19px] items-center justify-center text-charcoal-light hover:text-gold-600"
                >
                  <motion.span
                    key={wishlistBump}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.35, 1] }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <HeartIcon />
                  </motion.span>

                  {wishlistCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-semibold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to={customer ? '/account' : '/login'}
                  aria-label="Account"
                  className="hidden h-[19px] w-[19px] items-center justify-center text-charcoal-light hover:text-gold-600 sm:flex"
                >
                  <UserIcon />
                </Link>

                <Link
                  to="/cart"
                  aria-label="Cart"
                  ref={(el) => registerIconTarget('cart', el)}
                  className="relative flex h-[19px] w-[19px] items-center justify-center text-charcoal-light hover:text-gold-600"
                >
                  <motion.span
                    key={cartBump}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.35, 1] }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <CartIcon />
                  </motion.span>

                  {count > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-semibold text-white">
                      {count}
                    </span>
                  )}
                </Link>
              </div>

              <button
                aria-label="Menu"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="text-charcoal-light hover:text-gold-600 md:hidden"
              >
                <MenuIcon />
              </button>
            </>
          )}
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ top: mobileMenuTop }}
            className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto border-t border-stone-200 bg-white md:hidden"
          >
            <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="font-serif text-lg text-charcoal">Menu</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-light transition-colors hover:bg-stone-100 hover:text-gold-600"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <SearchBar
                placeholder="Search products..."
                iconClassName="left-3"
                inputClassName="w-full rounded-full border border-stone-300 py-2 pl-9 pr-3 text-sm focus:border-gold-400 focus:outline-none"
                onNavigate={() => setMobileMenuOpen(false)}
              />

              <NavLink
                to="/"
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                Home
              </NavLink>

              <NavLink
                to="/onlineshop"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                Shop
              </NavLink>

              <div className="border-y border-stone-100 py-2">
                <button
                  type="button"
                  aria-expanded={mobileCategoriesOpen}
                  aria-controls="mobile-category-links"
                  onClick={() => setMobileCategoriesOpen((open) => !open)}
                  className="flex w-full items-center justify-between py-1 text-left text-sm font-medium tracking-wide text-charcoal-light transition-colors hover:text-gold-600"
                >
                  Categories
                  <ChevronIcon open={mobileCategoriesOpen} />
                </button>

                <AnimatePresence initial={false}>
                  {mobileCategoriesOpen && (
                    <motion.div
                      id="mobile-category-links"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-3 pb-2 pl-3 pt-3">
                        {topCategories.length > 0 ? (
                          topCategories.map((cat) => (
                            <NavLink
                              key={cat.id}
                              to={`/onlineshop?category=${cat.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className={({ isActive }) => navLinkClass(isActive)}
                            >
                              {cat.name}
                            </NavLink>
                          ))
                        ) : (
                          <span className="text-sm text-charcoal-light">No categories yet.</span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  {link.label}
                </NavLink>
              ))}

              <NavLink
                to={customer ? '/account/wishlist' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                Wishlist
              </NavLink>

              <NavLink
                to={customer ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                {customer ? 'My Account' : 'Login'}
              </NavLink>

              {/* Mobile contact strip */}
              <div className="mt-2 flex flex-col gap-2 border-t border-stone-200 pt-3">
                <a
                  href={STORE_PHONE_HREF}
                  className="text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
                >
                  {STORE_PHONE}
                </a>
                <a
                  href={STORE_PHONE_SECONDARY_HREF}
                  className="text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
                >
                  {STORE_PHONE_SECONDARY}
                </a>
                <a
                  href={STORE_EMAIL_HREF}
                  className="text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
                >
                  {STORE_EMAIL}
                </a>
                <div className="flex items-center gap-2 pt-1">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.name}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-white transition-colors hover:bg-gold-600"
                    >
                      <SocialIcon name={social.name} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </header>
  );
});

function SocialIcon({ name, className }) {
  // Facebook and LinkedIn are solid glyphs; Instagram's mark is an outlined camera,
  // so it is drawn from primitives rather than one filled path — the single-path
  // version collapses into a blob at this size.
  const glyphs = {
    Facebook: (
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.9h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94z" />
    ),
    Instagram: (
      <>
        <rect
          x="2.75"
          y="2.75"
          width="18.5"
          height="18.5"
          rx="5.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
        />
        <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="2.1" />
        <circle cx="17.4" cy="6.6" r="1.45" />
      </>
    ),
    LinkedIn: (
      <path d="M6.94 5.5a2 2 0 11-4 0 2 2 0 014 0zM3.2 21.5h3.5V8.9H3.2v12.6zM9.2 8.9h3.35v1.73h.05c.47-.88 1.6-1.81 3.3-1.81 3.53 0 4.18 2.32 4.18 5.34v7.34h-3.49v-6.5c0-1.55-.03-3.55-2.16-3.55-2.17 0-2.5 1.69-2.5 3.44v6.61H9.2V8.9z" />
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      {glyphs[name]}
    </svg>
  );
}

function navLinkClass(isActive) {
  return `text-sm font-medium tracking-wide transition-colors ${
    isActive
      ? 'text-gold-600'
      : 'text-charcoal-light hover:text-gold-600'
  }`;
}

function CategoriesDropdown({ topCategories, subcategoriesOf }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const count = topCategories.length;

  // A fixed 640px / 4-column panel left empty grey cells when only a couple of
  // categories exist, so the panel now shrinks and centres with its content.
  const panelWidth =
    count <= 1
      ? 'w-[min(92vw,300px)]'
      : count === 2
        ? 'w-[min(92vw,460px)]'
        : count === 3
          ? 'w-[min(92vw,560px)]'
          : 'w-[min(92vw,640px)]';
  const gridCols =
    count <= 2 ? 'grid-cols-1 sm:grid-cols-2' : count === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4';

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium tracking-wide text-charcoal-light transition-colors hover:text-gold-600"
      >
        Categories
        <ChevronIcon open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn('absolute left-1/2 top-full z-30 -translate-x-1/2 pt-3', panelWidth)}
          >
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl ring-1 ring-black/5">
              <div className="h-1 w-full bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300" />

              <div className={cn('grid gap-px bg-stone-100', gridCols)}>
                {topCategories.length === 0 ? (
                  <p className="col-span-full px-6 py-5 text-sm text-charcoal-light">
                    No categories yet.
                  </p>
                ) : (
                  topCategories.map((cat) => {
                    const subs = subcategoriesOf(cat.id);

                    return (
                      <div
                        key={cat.id}
                        className="bg-white px-4 py-5"
                      >
                        <Link
                          to={`/onlineshop?category=${cat.slug}`}
                          onClick={() => setOpen(false)}
                          className="group mb-3 flex items-center gap-2.5 border-b border-stone-100 pb-3 font-serif text-[15px] text-charcoal hover:text-gold-600"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-50 text-sm font-semibold text-gold-700 transition-transform group-hover:scale-105">
                            {cat.name[0]}
                          </span>
                          {cat.name}
                        </Link>

                        {subs.length > 0 ? (
                          <ul className="space-y-0.5">
                            {subs.map((sub) => (
                              <li key={sub.id}>
                                <Link
                                  to={`/onlineshop?category=${sub.slug}`}
                                  onClick={() => setOpen(false)}
                                  className="block rounded-md px-2 py-1.5 text-[13px] text-charcoal-light transition-colors hover:bg-gold-50/60 hover:text-gold-700"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="px-2 text-[13px] text-stone-400">
                            Shop all {cat.name.toLowerCase()}
                          </p>
                        )}

                        <Link
                          to={`/onlineshop?category=${cat.slug}`}
                          onClick={() => setOpen(false)}
                          className="mt-3 inline-block text-[12px] font-medium text-gold-600 hover:text-gold-700"
                        >
                          Shop all {cat.name} &rarr;
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('transition-transform', open && 'rotate-180')}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SearchIcon(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 3.5 4 7.5C19 16.65 12 21 12 21z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 2.5h2l2.6 12.5a2 2 0 0 0 2 1.6h8a2 2 0 0 0 2-1.5l1.5-7H6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export default Header;