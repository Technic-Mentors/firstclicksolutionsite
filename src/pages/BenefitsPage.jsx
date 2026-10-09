import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Button from '../components/ui/Button';

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: 'spring', stiffness: 260, damping: 24, mass: 0.9 };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.06 } },
};

/* ═══════════════ Icons ═══════════════ */
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
    <motion.circle
      cx="12"
      cy="12"
      r="9"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 1, ease: EASE }}
    />
    <motion.path
      d="M12 7v5l3.5 2"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
    />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
    <motion.path
      d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 1.1, ease: EASE }}
    />
    <motion.path
      d="m9 12 2 2 4-4"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
    />
  </svg>
);
const IconLayers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
    <motion.path
      d="m12 3 9 5-9 5-9-5 9-5Z"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 1, ease: EASE }}
    />
    <motion.path
      d="m3 13 9 5 9-5"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
    />
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
    <motion.path
      d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 1.2, ease: EASE }}
    />
    <motion.circle
      cx="5.5"
      cy="18.5"
      r="2"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
    />
    <motion.circle
      cx="18.5"
      cy="18.5"
      r="2"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
    />
  </svg>
);
const IconBadge = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
    <motion.path
      d="m9 12 2 2 4-4"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
    />
    <motion.circle
      cx="12"
      cy="12"
      r="9"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 1, ease: EASE }}
    />
  </svg>
);
const IconLeaf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
    <motion.path
      d="M4 20c0-8 5-14 16-15 0 10-5 15-12 15H4z"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 1.2, ease: EASE }}
    />
    <motion.path
      d="M8 18c2-4 5-7 9-9"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
    />
  </svg>
);

/* ═══════════════ Data ═══════════════ */
const BENEFITS = [
  {
    icon: IconBadge,
    title: 'Tested, Not Just Wiped',
    desc: 'Every machine is stripped, cleaned and bench-tested — memory, storage health, thermals and ports all checked under load before it is listed for sale.',
  },
  {
    icon: IconShield,
    title: '12 Month Warranty',
    desc: 'All refurbished hardware is covered by a 12 month return-to-base warranty. If a fault develops, we repair or replace it.',
  },
  {
    icon: IconLayers,
    title: 'Business Specs, Home Prices',
    desc: 'Ex-corporate Dell, HP and Lenovo hardware is built to a higher standard than consumer kit — and costs a fraction of new second time around.',
  },
  {
    icon: IconClock,
    title: 'Ready to Use on Arrival',
    desc: 'Each machine ships with a fresh, activated installation of Windows 11 Pro. Unbox it, sign in and get on with your work.',
  },
  {
    icon: IconLeaf,
    title: 'Better for the Planet',
    desc: 'Refurbishing a desktop avoids a large share of the carbon cost of manufacturing a new one, and keeps working hardware out of landfill.',
  },
  {
    icon: IconTruck,
    title: 'Free UK Delivery & Collection',
    desc: 'Free delivery on orders over £250, usually dispatched within 48 hours — or collect from our Burnley unit, often the same working day.',
  },
];

export default function BenefitsPage() {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      {/* ══════════════ HERO ══════════════ */}
      <section className="relative overflow-hidden bg-gold-500 text-white">
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_28%,rgba(255,255,255,0.12),transparent_58%),radial-gradient(ellipse_at_82%_72%,rgba(0,0,0,0.08),transparent_58%)]"
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1.5, ease: EASE }}
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/75"
          >
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span className="text-white/50">/</span>
            <span className="font-medium text-white">Benefits</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mb-4 flex items-center justify-center gap-3"
          >
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              className="h-px w-10 origin-right bg-gradient-to-r from-transparent to-white/70"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85">
              Why Choose Us
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              className="h-px w-10 origin-left bg-gradient-to-l from-transparent to-white/70"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            Why buy <span className="text-white">refurbished</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            className="mx-auto mt-4 max-w-lg text-sm text-white/85 sm:text-base"
          >
            Professionally refurbished computers from Burnley — here&rsquo;s what you get that a
            cheap new machine won&rsquo;t give you.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
            className="mx-auto mt-6 h-px w-24 origin-center bg-gradient-to-r from-transparent via-white/80 to-transparent"
          />
        </div>
      </section>

      {/* ══════════════ BENEFIT CARDS ══════════════ */}
      <section className="relative overflow-hidden bg-white py-12 sm:py-14">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(240,108,12,0.1),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            variants={staggerContainer}
            initial={reduce ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={reduce ? undefined : fadeUp}
                whileHover={reduce ? undefined : { y: -6, transition: SPRING }}
                className="group relative flex min-h-64 flex-col overflow-hidden rounded-3xl border border-charcoal/8 bg-white p-6 text-left shadow-[0_14px_36px_rgba(28,25,23,0.05)] transition-all duration-300 hover:border-gold-500/35 hover:shadow-[0_20px_44px_rgba(28,25,23,0.1)] sm:p-7"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold-500 via-gold-400 to-leaf-500 transition-transform duration-500 group-hover:scale-x-100"
                />
                <div className="relative mb-6 flex items-center justify-between">
                  <motion.span
                    initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                    whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.12, ease: EASE }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-white"
                  >
                    <Icon />
                  </motion.span>
                  <span className="font-serif text-4xl leading-none text-charcoal/10 transition-colors duration-300 group-hover:text-gold-500/25">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="relative font-serif text-lg leading-snug text-charcoal transition-colors duration-300 group-hover:text-gold-600">
                  {title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-charcoal-light">{desc}</p>
                <span
                  aria-hidden
                  className="mt-auto block h-px w-10 bg-gold-500/50 pt-0 transition-all duration-300 group-hover:w-16"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="relative overflow-hidden bg-cream">
        <motion.div
          aria-hidden
          animate={reduce ? {} : { opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(240,108,12,0.14),transparent_60%)]"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6"
        >
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="font-serif text-2xl leading-tight text-charcoal sm:text-3xl lg:text-4xl"
          >
            Ready to find <span className="text-gold-600">the right machine?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal-light sm:text-base"
          >
            Browse desktops, laptops, gaming PCs, monitors and complete dual screen setups — all
            tested, all warranted, all ready to ship.
          </motion.p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/onlineshop">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button variant="gold" size="lg">Shop Now</Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
