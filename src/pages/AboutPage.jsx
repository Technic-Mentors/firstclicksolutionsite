import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  useInView,
} from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useAsync } from '../hooks/useAsync';
import { getFeaturedProducts } from '../api/catalog.api';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import Button from '../components/ui/Button';
import { assetUrl } from '../utils/media';

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: 'spring', stiffness: 260, damping: 24, mass: 0.9 };
const SPRING_SOFT = { type: 'spring', stiffness: 160, damping: 22 };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const slowStaggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.08 } },
};

const missionStaggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.28, delayChildren: 0.12 } },
};


/* ═══════════════ Word-by-word reveal ═══════════════ */
function RevealWords({ text, className = '', delay = 0, stagger = 0.04 }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ lineHeight: 1.15 }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.7, delay: delay + i * stagger, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ═══════════════ Icons ═══════════════ */
const IconQuality = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
    <motion.path
      d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.9l-4.8 2.5.9-5.4L4.2 8.2l5.4-.8L12 2z"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 1.1, ease: EASE }}
    />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
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
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
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
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
    <motion.path
      d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 1.2, ease: EASE }}
    />
    <motion.circle
      cx="12"
      cy="9"
      r="2.5"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
    />
  </svg>
);

/* ═══════════════ Data ═══════════════ */
const VALUES = [
  {
    icon: IconQuality,
    title: 'Tested, Not Just Wiped',
    desc: 'Memory, storage health, thermals and ports are all checked under load. Anything that fails is repaired or stripped for parts rather than sold on.',
  },
  {
    icon: IconShield,
    title: '12 Month Warranty',
    desc: 'Every refurbished machine is covered return-to-base, so you are not left stuck if a fault develops after it reaches you.',
  },
  {
    icon: IconTruck,
    title: 'Free UK Delivery',
    desc: 'Free on orders over £250 and usually dispatched within 48 hours — or collect from the Burnley unit, often the same working day.',
  },
  {
    icon: IconPin,
    title: 'A Real Workshop',
    desc: 'We are not a drop-shipper. Machines are refurbished, built and tested at our unit on Balderstone Lane, and you are welcome to visit.',
  },
];

const VISION_MISSION = [
  {
    key: 'vision',
    eyebrow: 'Our Vision',
    title: 'To make good computing affordable, and far less wasteful.',
    desc: 'Perfectly good business hardware gets replaced on a three-year cycle and thrown away. We think most of it has years of life left — and that a properly refurbished machine should be an obvious choice, not a compromise.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <motion.path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 1.1, ease: EASE }}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="3"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
        />
      </svg>
    ),
  },
  {
    key: 'mission',
    eyebrow: 'Our Mission',
    title: 'Refurbish properly, price fairly, stand behind it.',
    desc: 'Every machine is stripped, cleaned, data-wiped and bench-tested before it is listed. We grade honestly, we say what is in the box, and we back it for twelve months.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 1, ease: EASE }}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="6"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="2"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
        />
      </svg>
    ),
  },
];

const INTRO_PARAGRAPHS = [
  'First Click Solutions is a refurbished computer specialist based in Burnley, Lancashire. We take ex-corporate desktops, laptops and monitors — hardware built to a far higher standard than consumer kit — and bring them back to a condition we are happy to put our name on.',
  'Every machine is stripped down and cleaned, its drive wiped to recognised data-destruction standards, and its memory, storage health, thermals and ports bench-tested under load. Faulty parts are replaced and thermal paste renewed where it is needed. Only then does it get a fresh, activated copy of Windows 11 Pro and go on sale.',
  'We grade honestly. Grade A means little to no visible wear; Grade B means light scuffs on the casing. The grade describes how a machine looks, never how it performs — both are tested to the same standard and carry the same twelve month warranty.',
  'Alongside the shop we run a workshop: upgrades and repairs on machines you already own, bulk supply and staged rollouts for offices and schools, and trade-in or responsible recycling for old hardware. If you would rather talk it through than click, call us on 01282 421306 or come and see us.',
];

const STATS = [
  { value: 12, suffix: ' mo', label: 'Warranty as Standard' },
  { value: 7, suffix: '', label: 'Product Categories' },
  { value: 14, suffix: ' days', label: 'Return Window' },
  { value: 100, suffix: '%', label: 'Bench-Tested' },
];

const WORKFLOW = ['Inspect', 'Clean & wipe', 'Bench-test', 'Ready to ship'];

function RefurbishmentProgress() {
  return (
    <div className="mt-6 rounded-2xl border border-charcoal/5 bg-white/85 p-4 shadow-[0_12px_32px_rgba(28,25,23,0.06)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-charcoal">Every machine follows the same process</p>
        <span className="shrink-0 rounded-full bg-leaf-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-leaf-700">
          4 stages
        </span>
      </div>
      <div className="relative mt-4">
        <div aria-hidden className="absolute left-3 right-3 top-2 h-px bg-charcoal/10" />
        <motion.div
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
          className="absolute left-3 right-3 top-2 h-px origin-left bg-linear-to-r from-leaf-500 to-gold-500"
        />
        <ol className="relative grid grid-cols-4 gap-1">
          {WORKFLOW.map((step) => (
            <li key={step} className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-gold-500 shadow-[0_0_0_1px_rgba(240,108,12,0.25)]">
                <span className="h-1 w-1 rounded-full bg-white" />
              </span>
              <span className="text-[9px] font-medium leading-tight text-charcoal-light sm:text-[10px]">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ═══════════════ Scroll Progress Bar ═══════════════ */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-gold-400 via-gold-600 to-gold-400"
    />
  );
}

/* ═══════════════ Section Heading ═══════════════ */
function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0 }}
      className="mb-6 flex flex-col items-center text-center"
    >
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600"
      >
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
          className="h-px w-5 origin-right bg-gold-400"
        />
        {eyebrow}
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
          className="h-px w-5 origin-left bg-gold-400"
        />
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        className="font-serif text-xl text-charcoal sm:text-2xl"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="mt-1.5 max-w-md text-sm text-charcoal-light"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

/* ═══════════════ Stat Counter ═══════════════ */
function StatCounter({ value, suffix = '', label, delay = 0 }) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else {
        setCount(value);
        setDone(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, scale: 1.03, transition: SPRING }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className="relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl border border-charcoal/5 bg-white px-4 py-6 text-center shadow-[0_12px_32px_rgba(28,25,23,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(240,108,12,0.12)]"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-leaf-500 via-gold-500 to-gold-400"
      />

      <AnimatePresence>
        {done && (
          <motion.span
            aria-hidden
            initial={{ x: '-120%', opacity: 0 }}
            animate={{ x: '120%', opacity: [0, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-gold-100/80 to-transparent"
          />
        )}
      </AnimatePresence>

      <motion.span
        initial={{ letterSpacing: '0.2em' }}
        whileInView={{ letterSpacing: '0em' }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.8, delay: delay + 0.2, ease: EASE }}
        animate={done ? { scale: [1, 1.06, 1] } : {}}
        className="relative font-serif text-3xl text-charcoal sm:text-4xl lg:text-5xl"
      >
        {count.toLocaleString()}
        {suffix}
      </motion.span>
      <span className="relative text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-light sm:text-xs">
        {label}
      </span>
    </motion.div>
  );
}

/* ═══════════════ Stats Section ═══════════════ */
function StatsSection() {
  return (
    <section className="bg-cream-dark py-10 sm:py-12">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0 }}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 lg:grid-cols-4 lg:gap-6"
      >
        {STATS.map((s, i) => (
          <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} delay={i * 0.1} />
        ))}
      </motion.div>
    </section>
  );
}

function ProductCollageTile({ product, featured = false }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: EASE, delay: featured ? 0.08 : 0.2 }}
      className={`group relative isolate overflow-hidden rounded-2xl border border-white bg-white shadow-[0_18px_42px_rgba(28,25,23,0.12)] ring-1 ring-charcoal/5 ${
        featured ? 'min-h-95 sm:min-h-125' : 'min-h-45 sm:min-h-60'
      }`}
    >
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-br from-white via-cream to-leaf-50/70" />
      {product?.primary_image ? (
        <img
          src={assetUrl(product.primary_image)}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-700 group-hover:scale-105 sm:p-5"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-leaf-50 via-white to-gold-50">
          <span className="font-serif text-4xl text-gold-300">{product?.name?.[0] || 'F'}</span>
        </div>
      )}
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-charcoal/70 via-transparent to-transparent opacity-80" />
      {featured && (
        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-charcoal shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:text-[10px]">
          From our workshop
        </span>
      )}
      <figcaption className={`absolute inset-x-0 bottom-0 p-3 text-white sm:p-4 ${featured ? 'sm:p-5' : ''}`}>
        <span className="mb-1 block h-0.5 w-7 rounded-full bg-gold-400" />
        <span className={`line-clamp-2 font-serif leading-tight ${featured ? 'text-base sm:text-xl' : 'text-xs sm:text-sm'}`}>
          {product?.name || (featured ? 'Quality refurbished computers' : 'Tested and ready to go')}
        </span>
      </figcaption>
    </motion.figure>
  );
}

/* ═══════════════ Main About Page ═══════════════ */
export default function AboutPage() {
  const { data: featured, loading: featuredLoading } = useAsync(() => getFeaturedProducts(8), []);
  const reduce = useReducedMotion();

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroExitScale = useTransform(heroScroll, [0, 1], [1, 0.94]);
  const heroExitOpacity = useTransform(heroScroll, [0, 0.9], [1, 0]);
  const heroExitY = useTransform(heroScroll, [0, 1], [0, -40]);

  return (
    <div className="relative">
      <ScrollProgressBar />

      {/* ══════════════ HERO — Sunlit Gradient ══════════════ */}
      <section ref={heroRef} className="relative overflow-hidden bg-gold-500 text-white">
        <motion.div
          style={reduce ? {} : { scale: heroExitScale, opacity: heroExitOpacity, y: heroExitY }}
          className="absolute inset-0"
        >
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_28%,rgba(255,255,255,0.12),transparent_58%),radial-gradient(ellipse_at_82%_72%,rgba(0,0,0,0.08),transparent_58%)]"
          />
          <motion.div
            aria-hidden
            animate={
              reduce
                ? {}
                : {
                    x: ['-4%', '4%', '-4%'],
                    y: ['-3%', '3%', '-3%'],
                  }
            }
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -inset-20"
            style={{
              background:
                'radial-gradient(circle at 32% 38%, rgba(255,255,255,0.10), transparent 55%), radial-gradient(circle at 70% 62%, rgba(0,0,0,0.06), transparent 55%)',
              filter: 'blur(30px)',
            }}
          />
        </motion.div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/75"
          >
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span className="text-white/50">/</span>
            <span className="font-medium text-white">About</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mb-4 flex items-center justify-center gap-3"
          >
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
              className="h-px w-10 origin-right bg-gradient-to-r from-transparent to-white/70"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85">
              Our Story
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
              className="h-px w-10 origin-left bg-gradient-to-l from-transparent to-white/70"
            />
          </motion.div>

          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            <RevealWords text="About First Click Solutions" delay={0.35} stagger={0.08} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
            className="mx-auto mt-4 max-w-lg text-sm text-white/85 sm:text-base"
          >
            Refurbished computers, properly tested, from a real workshop in Burnley.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
            className="mx-auto mt-6 h-px w-24 origin-center bg-gradient-to-r from-transparent via-white/80 to-transparent"
          />
        </div>
      </section>

      {/* ══════════════ INTRO — text left, collage right ══════════════ */}
      <section className="relative overflow-hidden bg-cream-dark py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          {/* LEFT: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex h-full flex-col justify-center"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600"
            >
              <span className="h-px w-5 bg-gold-400" />
              Our Journey
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              className="font-serif text-2xl leading-tight text-charcoal sm:text-3xl lg:text-4xl"
            >
              Properly Tested, <span className="text-gold-600">Honestly Graded.</span>
            </motion.h2>

            <div className="mt-4 space-y-3">
              {INTRO_PARAGRAPHS.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: EASE }}
                  className="text-sm leading-relaxed text-charcoal-light"
                >
                  {para}
                </motion.p>
              ))}
            </div>
            <RefurbishmentProgress />
          </motion.div>

          {/* Product collage: one feature image with two supporting details. */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="relative mx-auto w-full max-w-155"
          >
            <div className="grid min-h-95 grid-cols-[1.15fr_0.85fr] items-center gap-3 sm:min-h-125 sm:gap-4">
              <ProductCollageTile product={featured?.[0]} featured />
              <div className="grid gap-3 sm:gap-4">
                <ProductCollageTile product={featured?.[1]} />
                <ProductCollageTile product={featured?.[2]} />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-charcoal/5 bg-white/80 px-4 py-3 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-50 text-leaf-700">
                <IconShield />
              </span>
              <div>
                <p className="text-xs font-semibold text-charcoal">Checked by our Burnley team</p>
                <p className="mt-0.5 text-[11px] text-charcoal-light">Every device is cleaned, tested and covered by warranty.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ VALUES ══════════════ */}
      <section className="relative overflow-hidden bg-cream-dark py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(240,108,12,0.06),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="What We Stand For" title="Our Values" />

          <motion.div
            variants={slowStaggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -5, transition: SPRING }}
                className="group flex flex-col items-center rounded-2xl border border-charcoal/5 bg-white p-6 text-center shadow-[0_12px_32px_rgba(28,25,23,0.05)] transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_18px_38px_rgba(28,25,23,0.09)]"
              >
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.6, delay: i * 0.18, ease: EASE }}
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-gold-600 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-white"
                >
                  <motion.span
                    aria-hidden
                    initial={{ scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: [0.6, 1.6], opacity: [0.6, 0] }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 1.2, delay: 0.4 + i * 0.18, ease: EASE }}
                    className="absolute inset-0 rounded-full border border-gold-500/50"
                  />
                  <Icon />
                </motion.span>
                <h3 className="relative mb-2 font-serif text-base text-charcoal transition-colors duration-300 group-hover:text-gold-600">
                  {title}
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    className="absolute -bottom-1 left-0 h-px w-full origin-left bg-gold-500/60"
                  />
                </h3>
                <p className="text-xs leading-relaxed text-charcoal-light">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ VISION & MISSION ══════════════ */}
      <section className="relative overflow-hidden bg-white py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(144,192,48,0.07),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="What Drives Us"
            title="Our Vision & Mission"
            subtitle="The two principles behind every machine that leaves the workshop."
          />

          <motion.div
            variants={missionStaggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-6"
          >
              {VISION_MISSION.map((item) => {
                const isVision = item.key === 'vision';
                return (
                  <motion.div
                    key={item.key}
                    variants={fadeUp}
                    className={`group relative flex min-h-full flex-col overflow-hidden rounded-3xl border bg-white p-6 shadow-[0_16px_40px_rgba(28,25,23,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(28,25,23,0.1)] sm:p-8 ${
                      isVision
                        ? 'border-gold-500/20'
                        : 'border-leaf-700/15'
                    }`}
                  >
                    <div
                      aria-hidden
                      className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${
                        isVision ? 'bg-gold-500/8' : 'bg-leaf-500/10'
                      }`}
                    />
                    <div className="relative flex items-center justify-between">
                      <motion.span
                        whileHover={{ scale: 1.08, rotate: isVision ? -4 : 4 }}
                        transition={SPRING}
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                          isVision
                            ? 'bg-gold-500/10 text-gold-600'
                            : 'bg-leaf-500/10 text-leaf-700'
                        }`}
                      >
                        {item.icon}
                      </motion.span>
                      <span
                        aria-hidden
                        className={`font-serif text-6xl leading-none ${
                          isVision ? 'text-gold-500/15' : 'text-leaf-700/15'
                        }`}
                      >
                        {isVision ? '01' : '02'}
                      </span>
                    </div>
                    <div className="relative mt-7">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                          isVision ? 'text-gold-600' : 'text-leaf-700'
                        }`}
                      >
                        {item.eyebrow}
                      </span>
                      <h3 className="mt-2 max-w-sm font-serif text-xl leading-snug text-charcoal sm:text-2xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
                        {item.desc}
                      </p>
                    </div>
                    <div
                      aria-hidden
                      className={`mt-auto pt-7 ${
                        isVision ? 'text-gold-500' : 'text-leaf-700'
                      }`}
                    >
                      <span
                        className={`block h-1 w-14 rounded-full transition-all duration-300 group-hover:w-24 ${
                          isVision ? 'bg-gold-500' : 'bg-leaf-600'
                        }`}
                      />
                    </div>
                  </motion.div>
                );
              })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <StatsSection />

      {/* ══════════════ FEATURED PRODUCTS ══════════════ */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Our Collection"
          title="Featured Machines"
          subtitle="A closer look at what is on the bench and ready to ship."
        />

        <AnimatePresence mode="wait">
          {featuredLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : featured?.length ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0 }}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
              >
                {featured.map((product, i) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 24, rotate: i % 2 ? 1.5 : -1.5 },
                      show: {
                        opacity: 1,
                        y: 0,
                        rotate: 0,
                        transition: { duration: 0.6, ease: EASE },
                      },
                    }}
                    whileHover={{ y: -6, transition: SPRING }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="mt-6 text-center"
              >
                <Link to="/" className="group/btn inline-block">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}>
                    <Button variant="outline" size="lg">
                      <span className="inline-flex items-center gap-2">
                        View All Products
                        <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                          →
                        </span>
                      </span>
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <p className="text-center text-charcoal-light">New arrivals coming soon.</p>
          )}
        </AnimatePresence>
        </div>
      </section>

      {/* ══════════════ OUR PROMISE ══════════════ */}
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-2 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          whileHover={{ y: -4 }}
          className="relative rounded-xl border border-gold-500/15 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8"
        >
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-transparent via-gold-400/70 to-transparent"
          />
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-right bg-gradient-to-l from-transparent via-gold-400/70 to-transparent"
          />

          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
            className="mb-1.5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600"
          >
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              className="h-px w-5 origin-right bg-gold-400"
            />
            Our Promise to You
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              className="h-px w-5 origin-left bg-gold-400"
            />
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            className="mt-3 text-sm leading-relaxed text-charcoal-light sm:text-base"
          >
            Every machine is stripped, cleaned, data-wiped and bench-tested before it reaches you, then backed
            by a twelve month return-to-base warranty. We grade honestly and list exactly what is in the box. If
            anything is not right, our team is one call away.
          </motion.p>
        </motion.div>
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
          <div className="mb-1 flex items-center justify-center gap-3">
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="h-px w-10 origin-right bg-gradient-to-r from-transparent to-gold-500/60"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-600">
              Ready to Begin?
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="h-px w-10 origin-left bg-gradient-to-l from-transparent to-gold-500/60"
            />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="font-serif text-2xl leading-tight text-charcoal sm:text-3xl lg:text-4xl"
          >
            Find the <span className="text-gold-600">Right Machine</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
            className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal-light sm:text-base"
          >
            Browse refurbished desktops, laptops, gaming PCs, monitors and complete dual screen setups —
            every one tested, graded honestly and backed for twelve months.
          </motion.p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/onlineshop">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
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