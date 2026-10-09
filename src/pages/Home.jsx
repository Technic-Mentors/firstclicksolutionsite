import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useAsync } from '../hooks/useAsync';
import { getBanners } from '../api/banners.api';
import { getFeaturedProducts, getCategories, getProducts } from '../api/catalog.api';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import Button from '../components/ui/Button';
import { assetUrl } from '../utils/media';
import { CategoryIcon } from '../components/icons/CategoryIcons';
import { formatCurrency } from '../utils/format';
import {
  STORE_PHONE,
  STORE_PHONE_HREF,
  STORE_EMAIL,
  STORE_EMAIL_HREF,
  STORE_ADDRESS_LINES,
  STORE_MAP_URL,
} from '../config/site';

/* ═══════════════════════════════════════════════════════════
   FIRST CLICK SOLUTIONS — HOME PAGE

   Light theme throughout, but no plain-white bands. Sections alternate between a warm
   orange tint (gold-*) and a soft green tint (leaf-*), with a solid orange marquee strip
   and a gradient stats band to break the page up. Cards stay white so they pop off the
   tinted backgrounds. No dark sections — depth comes from tint, border and shadow.
   ═══════════════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: 'spring', stiffness: 260, damping: 24, mass: 0.9 };
const SLIDE_INTERVAL_MS = 5500;

const FREE_DELIVERY_OVER = '£250';
const WARRANTY_MONTHS = 12;
const RETURN_DAYS = 14;

const LINKS = { about: '/about', contact: '/contact', faq: '/faq', shop: '/onlineshop' };

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500';

/* Section backgrounds — alternate warm / fresh so the page never reads as white. */
const BG_WARM = 'bg-gradient-to-b from-gold-50 to-gold-100/70';
const BG_FRESH = 'bg-gradient-to-b from-leaf-50 to-leaf-100/70';

const MARQUEE_ITEMS = [
  `Free UK delivery over ${FREE_DELIVERY_OVER}`,
  `${WARRANTY_MONTHS} month warranty on every machine`,
  'Fully tested before dispatch',
  'Windows 11 Pro installed and activated',
  `${RETURN_DAYS} day returns`,
  'Collect in store — Burnley',
  'Trade and education accounts welcome',
  'Data-wiped to recognised standards',
];

// Mirrors the brands carried in the catalogue (products.fabric holds the brand).
const BRANDS = [
  { name: 'Dell', note: 'OptiPlex · Latitude' },
  { name: 'HP', note: 'EliteDesk · EliteBook' },
  { name: 'Lenovo', note: 'ThinkCentre · ThinkPad' },
  { name: 'Gaming PC', note: 'Custom builds' },
  { name: 'Mixed Brands', note: 'Bundles · Monitors' },
];

// Alternating accent so the category grid reads as the logo's two colours.
const CATEGORY_ACCENTS = [
  'from-gold-400 to-gold-600',
  'from-leaf-400 to-leaf-600',
  'from-gold-500 to-gold-700',
  'from-leaf-500 to-leaf-700',
];

const GRADES = [
  {
    key: 'A',
    label: 'Grade A',
    tone: 'Excellent',
    fill: 0.95,
    text: 'Near-indistinguishable from new. Minimal or no cosmetic marks, and often still in its original housing.',
    points: ['Little to no visible wear', 'Fully tested and cleaned', 'Best choice for client-facing desks'],
  },
  {
    key: 'B',
    label: 'Grade B',
    tone: 'Very good',
    fill: 0.72,
    text: 'Light cosmetic wear such as small scuffs or scratches on the case. Performance is identical to Grade A.',
    points: ['Light cosmetic marks', 'Same tested internals', 'The best value in the range'],
  },
  {
    key: 'R',
    label: 'Refurbished build',
    tone: 'Rebuilt',
    fill: 0.85,
    text: 'Our own builds — a refurbished chassis fitted with new parts such as a graphics card, PSU, memory or storage.',
    points: ['New components fitted', 'Stress-tested under load', 'Built in our Burnley workshop'],
  },
];

const SERVICES = [
  {
    icon: 'cpu',
    title: 'Upgrades and repairs',
    text: 'Memory, storage, graphics and power supply upgrades, plus diagnostics and repair on machines you already own.',
    accent: 'gold',
  },
  {
    icon: 'briefcase',
    title: 'Business and education IT',
    text: 'Bulk desktop and laptop supply for offices, schools and charities, with matched specs and staged rollouts.',
    accent: 'leaf',
  },
  {
    icon: 'recycle',
    title: 'Trade-in and recycling',
    text: 'Bring in old hardware for trade-in or responsible recycling. Drives are wiped to recognised data standards.',
    accent: 'gold',
  },
];

const STATS = [
  { value: 12, suffix: ' mo', label: 'Warranty as standard', icon: 'shield' },
  { value: 7, suffix: '', label: 'Product categories', icon: 'monitor' },
  { value: 48, suffix: 'h', label: 'Typical UK dispatch', icon: 'truck' },
  { value: 100, suffix: '%', label: 'Tested before dispatch', icon: 'check' },
];

const WHY = [
  {
    icon: 'shield',
    title: `${WARRANTY_MONTHS} month warranty`,
    text: 'Every machine is covered return-to-base, so you are not left stuck if something goes wrong.',
    accent: 'gold',
  },
  {
    icon: 'check',
    title: 'Tested, not just wiped',
    text: 'We bench-test memory, storage health and thermals before anything is listed for sale.',
    accent: 'leaf',
  },
  {
    icon: 'leaf',
    title: 'Better for the planet',
    text: 'Refurbishing a desktop avoids a large share of the carbon cost of manufacturing a new one.',
    accent: 'leaf',
  },
  {
    icon: 'tag',
    title: 'Business specs, home prices',
    text: 'Corporate hardware is built to a higher standard than consumer kit — and costs far less second time around.',
    accent: 'gold',
  },
];

const TESTIMONIALS = [
  {
    name: 'Daniel R.',
    location: 'Burnley',
    quote:
      'Picked up a dual screen setup for my home office. It arrived set up and ready to go, both monitors matched, and it has not missed a beat since. Far better value than buying new.',
  },
  {
    name: 'Priya S.',
    location: 'Manchester',
    quote:
      'We bought eight refurbished desktops for the office. Identical specs across all of them, delivered on the day promised, and the team sorted a memory upgrade on two of them without any fuss.',
  },
  {
    name: 'Mark T.',
    location: 'Preston',
    quote:
      'My son wanted a gaming PC and the budget would not stretch to new. The starter build handles everything he plays at 1080p and the twelve month warranty gave me peace of mind.',
  },
];

const FAQS = [
  {
    q: 'What does "refurbished" actually mean here?',
    a: 'Every machine is stripped down, cleaned, data-wiped and bench-tested. Faulty parts are replaced, thermal paste is renewed where needed, and a fresh activated copy of Windows 11 Pro is installed before it is listed.',
  },
  {
    q: 'What is the difference between Grade A and Grade B?',
    a: 'The grade describes cosmetic condition only, never performance. Grade A has little to no visible wear; Grade B has light scuffs or scratches on the casing. Both are tested to the same standard and carry the same warranty.',
  },
  {
    q: 'What warranty do I get?',
    a: `All refurbished hardware comes with a ${WARRANTY_MONTHS} month return-to-base warranty. If a fault develops, contact us and we will arrange repair or replacement.`,
  },
  {
    q: 'How much is delivery?',
    a: `UK mainland delivery is free on orders over ${FREE_DELIVERY_OVER}, and charged at a flat rate below that. Orders usually leave us within 48 hours. You are also welcome to collect from our Burnley unit.`,
  },
  {
    q: 'Can I return something if it is not right?',
    a: `Yes — you have ${RETURN_DAYS} days from delivery to return an item unused and in its original packaging. Get in touch and we will arrange it.`,
  },
  {
    q: 'Do you supply businesses and schools?',
    a: 'We do. We can supply matched machines in bulk, stage a rollout, and set up trade or education accounts. Call us to talk through what you need.',
  },
  {
    q: 'What happens to the data on the old drives?',
    a: 'Every drive is wiped to recognised data-destruction standards before a machine is resold, and drives that fail testing are physically destroyed rather than reused.',
  },
  {
    q: 'Who do I contact if something is wrong?',
    a: `Call us on ${STORE_PHONE}, email ${STORE_EMAIL}, or use the contact page and we will come back to you.`,
  },
];

/* ═══════════════ Motion helpers ═══════════════ */
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const ITEM = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};
const REVEAL = {
  up: { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -28 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 28 }, show: { opacity: 1, x: 0 } },
  scale: {
    hidden: { opacity: 0, scale: 0.94, rotateX: 7, y: 24, transformPerspective: 1000 },
    show: { opacity: 1, scale: 1, rotateX: 0, y: 0, transformPerspective: 1000 },
  },
};

function Reveal({ children, variant = 'up', delay = 0, className = '' }) {
  return (
    <motion.div
      variants={REVEAL[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WordReveal({ text, as: Tag = 'span', className = '', delay = 0 }) {
  // Each word starts translated fully below its own overflow-hidden wrapper, which
  // clips it out of the intersection rect. Observing the words themselves therefore
  // deadlocks — they can never register as "in view", so the reveal never fires and
  // the heading stays invisible. Observe the unclipped heading instead and drive the
  // words from that.
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <Tag ref={ref} className={className}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="mr-[0.25em] mb-[-0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={inView ? { y: 0 } : { y: '110%' }}
            transition={{ duration: 0.6, ease: EASE, delay: delay + i * 0.05 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

function Magnetic({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });
  return (
    <motion.div
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.22);
        y.set((e.clientY - r.top - r.height / 2) * 0.3);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="fc-btn inline-block"
    >
      {children}
    </motion.div>
  );
}

function TiltCard({ children, max = 6 }) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hover = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 20 });
  const gx = useTransform(px, [-0.5, 0.5], [0, 100]);
  const gy = useTransform(py, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(220px circle at ${gx}% ${gy}%, rgba(255,255,255,0.22), transparent 65%)`;
  const glareOpacity = useSpring(hover, { stiffness: 160, damping: 22 });
  return (
    <motion.div
      className="relative h-full rounded-2xl"
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ scale: 1.012 }}
      onMouseEnter={() => hover.set(1)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        px.set(0);
        py.set(0);
        hover.set(0);
      }}
    >
      {children}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
        style={{ background: glare, opacity: glareOpacity }}
      />
    </motion.div>
  );
}

/* ═══════════════ FX: css, particles, depth layers ═══════════════ */
const FX_CSS = `
@keyframes fc-float{0%,100%{transform:translate3d(0,0,0) rotate(0)}50%{transform:translate3d(0,-14px,0) rotate(4deg)}}
@keyframes fc-drift{0%{transform:translate3d(0,0,0);opacity:0}15%{opacity:.75}85%{opacity:.75}100%{transform:translate3d(var(--dx,20px),-140px,0);opacity:0}}
@keyframes fc-grid{from{background-position:0 0}to{background-position:0 48px}}
@keyframes fc-spin{to{transform:rotate(360deg)}}
@keyframes fc-spin-r{to{transform:rotate(-360deg)}}
@keyframes fc-sweep{0%{transform:translateX(-120%) skewX(-18deg)}55%,100%{transform:translateX(380%) skewX(-18deg)}}
@keyframes fc-dash{to{stroke-dashoffset:-120}}
@keyframes fc-pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
@keyframes fc-glow{0%,100%{opacity:.45}50%{opacity:.85}}
.fc-ring{transform-box:fill-box;transform-origin:center;animation:fc-spin 70s linear infinite}
.fc-ring-r{transform-box:fill-box;transform-origin:center;animation:fc-spin-r 95s linear infinite}
.fc-node{transform-box:fill-box;transform-origin:center;animation:fc-pulse 3.2s ease-in-out infinite}
.fc-btn{transition:filter .3s ease}
.fc-btn:hover{filter:drop-shadow(0 10px 18px rgba(240,108,12,.35))}
@media (prefers-reduced-motion: reduce){.fc-anim,.fc-anim *{animation:none!important}}
`;

function useLite() {
  const q = '(max-width: 767px)';
  const [lite, setLite] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setLite(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return lite;
}

const DOTS = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 53 + 7) % 100,
  y: 20 + ((i * 37) % 75),
  s: 2 + (i % 3),
  d: 7 + (i % 5) * 2,
  dl: -(i * 1.7),
  dx: (i % 2 ? 1 : -1) * (10 + (i % 4) * 8),
}));

function Particles({ count = 18, color }) {
  const lite = useLite();
  const n = lite ? Math.min(6, count) : count;
  return (
    <div aria-hidden className="fc-anim pointer-events-none absolute inset-0 overflow-hidden">
      {DOTS.slice(0, n).map((p, i) => {
        const c = color || (i % 2 ? '#90c030' : '#f06c0c');
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.s,
              height: p.s,
              background: c,
              boxShadow: `0 0 ${p.s * 3}px ${c}`,
              opacity: 0,
              '--dx': `${p.dx}px`,
              animation: `fc-drift ${p.d}s linear ${p.dl}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

function PerspectiveGrid() {
  const mask = 'linear-gradient(to top, black 0%, transparent 85%)';
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] overflow-hidden"
      style={{ perspective: 600 }}
    >
      <div
        className="fc-anim absolute inset-x-[-60%] bottom-[-30%] h-[160%] origin-bottom"
        style={{
          transform: 'rotateX(62deg)',
          backgroundImage:
            'linear-gradient(rgba(240,108,12,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(144,192,48,.22) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: mask,
          WebkitMaskImage: mask,
          animation: 'fc-grid 4s linear infinite',
        }}
      />
    </div>
  );
}

/* Three parallax layers: far (rings), mid (floating shapes), near (nodes + lines). */
function HeroDepth({ progress }) {
  const lite = useLite();
  const yMid = useTransform(progress, [0, 1], [0, lite ? 30 : 90]);
  const shape = 'absolute border bg-white/20 backdrop-blur-[1px]';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <PerspectiveGrid />

      {/* mid: floating geometry */}
      <motion.div style={{ y: yMid }} className="fc-anim absolute inset-0">
        <span
          className={`${shape} left-[5%] top-[20%] h-10 w-10 rounded-lg border-gold-500/40`}
          style={{ animation: 'fc-float 9s ease-in-out infinite' }}
        />
        <span
          className={`${shape} right-[8%] top-[14%] h-7 w-7 rotate-45 rounded-md border-leaf-500/50`}
          style={{ animation: 'fc-float 11s ease-in-out -3s infinite' }}
        />
        <span
          className={`${shape} bottom-[24%] left-[44%] hidden h-12 w-12 rounded-xl border-leaf-500/40 md:block`}
          style={{ animation: 'fc-float 13s ease-in-out -6s infinite' }}
        />
        <span
          className={`${shape} bottom-[16%] right-[6%] hidden h-9 w-9 rounded-full border-gold-500/40 md:block`}
          style={{ animation: 'fc-float 10s ease-in-out -2s infinite' }}
        />
      </motion.div>

      <Particles count={16} />
    </div>
  );
}

/* ═══════════════ Icons ═══════════════ */
const ICONS = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  left: <path d="M15 18l-6-6 6-6" />,
  right: <path d="M9 18l6-6-6-6" />,
  truck: (
    <>
      <path d="M2 6h11v11H2zM13 10h4l4 4v3h-8z" />
      <circle cx="6.5" cy="19" r="1.8" />
      <circle cx="16.5" cy="19" r="1.8" />
    </>
  ),
  tag: (
    <>
      <path d="M12.5 2H4a2 2 0 0 0-2 2v8.5a2 2 0 0 0 .59 1.41l9 9a2 2 0 0 0 2.82 0l7.5-7.5a2 2 0 0 0 0-2.82l-9-9A2 2 0 0 0 12.5 2Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M9 1.5v2M15 1.5v2M9 20.5v2M15 20.5v2M1.5 9h2M1.5 15h2M20.5 9h2M20.5 15h2" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="3.5" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 16.5V21" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 12h20" />
    </>
  ),
  recycle: (
    <>
      <path d="M7 19H5a2 2 0 0 1-1.7-3l1.5-2.5M12 3l1.8 3M17 19h2a2 2 0 0 0 1.7-3l-3.2-5.4" />
      <path d="m10.2 6-3 5.2M9 19h6M13.8 6l3.2 5.4" />
    </>
  ),
  leaf: (
    <>
      <path d="M4 20c0-8 5-14 16-15 0 10-5 15-12 15H4Z" />
      <path d="M8 18c2-4 5-7 9-9" />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  ),
  mail: (
    <>
      <rect x="2" y="4.5" width="20" height="15" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  pin: (
    <>
      <path d="M12 22s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="11" r="2.5" />
    </>
  ),
};

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}

function Star({ className = 'h-3.5 w-3.5 fill-gold-500' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
    </svg>
  );
}

/* ═══════════════ Small building blocks ═══════════════ */
function Badge({ children, accent = 'gold', className = '' }) {
  const tone =
    accent === 'leaf'
      ? 'border-leaf-500/30 bg-leaf-500/10 text-leaf-700'
      : 'border-gold-500/30 bg-gold-500/10 text-gold-700';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone} ${className}`}
    >
      <motion.span
        className="h-1.5 w-1.5 rounded-full bg-current"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {children}
    </span>
  );
}

function SectionHeading({ title, subtitle, badge, badgeAccent = 'gold', align = 'left' }) {
  return (
    <div className={`mb-5 max-w-xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {badge && <Badge accent={badgeAccent}>{badge}</Badge>}
      <WordReveal
        as="h2"
        text={title}
        className="mt-2 block font-serif text-2xl leading-tight text-charcoal sm:text-3xl"
      />
      {/* Brand rule that wipes out from the heading as it scrolls into view. */}
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
        className={`mt-2.5 block h-0.5 w-20 rounded-full bg-gradient-to-r from-gold-500 to-leaf-500 ${
          align === 'center' ? 'mx-auto origin-center' : 'origin-left'
        }`}
      />
      {subtitle && (
        <Reveal delay={0.15}>
          <p className="mt-2.5 text-sm text-charcoal-light">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-leaf-500 to-gold-500"
    />
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 1.2);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.92 }}
          transition={SPRING}
          className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gold-600 text-white shadow-lg shadow-gold-600/30 ${FOCUS}`}
        >
          <Icon name="arrow" className="h-5 w-5 -rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function Marquee({ items, speed = 40, reverse = false, light = false }) {
  const list = [...items, ...items];
  const [paused, setPaused] = useState(false);
  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="flex w-max whitespace-nowrap"
        animate={paused ? undefined : { x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        {list.map((t, i) => (
          <span
            key={i}
            className={`flex items-center gap-8 pr-8 font-serif text-base italic ${
              light ? 'text-white' : 'text-charcoal/80'
            }`}
          >
            {t}
            <Star
              className={
                light
                  ? i % 2
                    ? 'h-3 w-3 fill-white/60'
                    : 'h-3 w-3 fill-white'
                  : i % 2
                    ? 'h-3 w-3 fill-leaf-500'
                    : 'h-3 w-3 fill-gold-500'
              }
            />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════ Hero ═══════════════ */
/* Faint circuit-board dot grid. */
function CircuitBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        }}
      />
    </div>
  );
}

function HeroVideo() {
  const videos = [
    { src: '/laptop%20complet.mp4', label: 'Laptop ready to work', accent: 'from-gold-500/35' },
    { src: '/HP%20ProBook%20440.mp4', label: 'HP ProBook 440', accent: 'from-leaf-500/35' },
    { src: '/robot.mp4', label: 'Technology, renewed', accent: 'from-gold-500/35' },
  ];

  return (
    <div aria-label="Featured refurbished computers and technology" className="grid w-full grid-cols-3 items-center gap-2.5 sm:gap-4 lg:flex-1 lg:gap-3 xl:gap-4">
      {videos.map((video, index) => (
        <motion.div
          key={video.src}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 + index * 0.12 }}
          className={`group relative overflow-hidden rounded-2xl border border-white/80 bg-charcoal shadow-[0_20px_54px_rgba(28,25,23,0.2)] ring-1 ring-charcoal/10 lg:aspect-auto ${
            index === 1
              ? 'aspect-[0.62] sm:aspect-[0.68] lg:h-[clamp(24rem,58svh,36rem)] lg:-translate-y-3'
              : 'aspect-[0.7] sm:aspect-[0.76] lg:h-[clamp(22rem,54svh,34rem)]'
          }`}
        >
          <video
            src={video.src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
            onLoadedMetadata={(event) => {
              event.currentTarget.playbackRate = 1;
            }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${video.accent} via-transparent to-charcoal/5`}
          />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/75 to-transparent px-2 pb-2.5 pt-8 text-center text-[10px] font-medium leading-tight text-white sm:px-3 sm:pb-3 sm:text-xs">
            {video.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

const BENCH = ['Memory test', 'Storage health', 'Thermals under load', 'Windows 11 Pro activated', 'Drive wiped'];

/* Hero centrepiece: floats in space, lid opens on load, bench test on screen, follows the mouse. */
function LaptopMock() {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 18 });
  const [step, setStep] = useState(0);
  const ready = step > BENCH.length;

  useEffect(() => {
    const t = setTimeout(
      () => setStep((s) => (s > BENCH.length ? 0 : s + 1)),
      ready ? 2800 : step === 0 ? 1700 : 700
    );
    return () => clearTimeout(t);
  }, [step, ready]);

  const chip =
    'absolute z-20 flex items-center gap-1.5 rounded-full border bg-white/95 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur';
  const holo = 'absolute z-20 hidden w-28 rounded-xl border bg-white/80 p-2.5 shadow-lg backdrop-blur sm:block';
  const orb =
    'absolute z-20 hidden h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-lg ring-1 backdrop-blur sm:flex';

  return (
    <div
      className="pointer-events-auto relative mx-auto w-full max-w-[34rem] select-none"
      style={{ perspective: 1300 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      {/* orbit rings under the machine */}
      <svg
        aria-hidden
        viewBox="0 0 400 60"
        className="fc-anim pointer-events-none absolute -bottom-10 left-1/2 hidden h-14 w-[110%] -translate-x-1/2 overflow-visible sm:block"
      >
        <ellipse
          cx="200"
          cy="30"
          rx="190"
          ry="24"
          fill="none"
          stroke="#f06c0c"
          strokeOpacity=".4"
          strokeDasharray="3 9"
          style={{ animation: 'fc-dash 8s linear infinite' }}
        />
        <ellipse
          cx="200"
          cy="30"
          rx="150"
          ry="17"
          fill="none"
          stroke="#90c030"
          strokeOpacity=".45"
          strokeDasharray="2 7"
          style={{ animation: 'fc-dash 6s linear infinite reverse' }}
        />
        <circle r="3.5" fill="#f06c0c">
          <animateMotion dur="9s" repeatCount="indefinite" path="M10 30 a190 24 0 1 0 380 0 a190 24 0 1 0 -380 0" />
        </circle>
        <circle r="3" fill="#90c030">
          <animateMotion dur="13s" repeatCount="indefinite" path="M50 30 a150 17 0 1 1 300 0 a150 17 0 1 1 -300 0" />
        </circle>
      </svg>

      {/* glow under the machine */}
      <motion.div
        aria-hidden
        className="absolute -bottom-6 left-1/2 h-10 w-4/5 -translate-x-1/2 rounded-full bg-gold-500/40 blur-2xl"
        animate={{ opacity: [0.5, 0.9, 0.5], scaleX: [0.9, 1.05, 0.9] }}
        transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
      />

      {/* screen glow behind the lid */}
      <span
        aria-hidden
        className="fc-anim pointer-events-none absolute left-1/2 top-[10%] h-3/5 w-4/5 -translate-x-1/2 rounded-full bg-emerald-400/25 blur-3xl"
        style={{ animation: 'fc-glow 5s ease-in-out infinite' }}
      />

      {/* FLOAT WRAPPER */}
      <motion.div
        animate={{ y: [0, -12, 0], rotateZ: [-0.6, 0.6, -0.6] }}
        transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative">
          {/* LID */}
          <motion.div
            initial={{ rotateX: -96 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
            style={{ transformOrigin: '50% 100%', transformStyle: 'preserve-3d' }}
            className="relative mx-auto w-[88%] rounded-t-2xl border-[7px] border-b-0 border-[#2b2f33] bg-[#2b2f33] shadow-2xl"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-gradient-to-br from-[#0d1f17] via-[#10241b] to-[#1b1608] p-4 font-mono text-[11px] leading-relaxed text-emerald-300 sm:text-xs">
              {/* webcam */}
              <span className="absolute left-1/2 top-1.5 h-1 w-1 -translate-x-1/2 rounded-full bg-white/30" />

              <p className="mb-2 flex items-center justify-between text-white/50">
                <span>firstclick@burnley:~$ bench --full</span>
                <span className="flex gap-1">
                  <i className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                  <i className="h-1.5 w-1.5 rounded-full bg-leaf-400" />
                </span>
              </p>

              <ul className="space-y-1">
                {BENCH.map((b, i) => (
                  <motion.li
                    key={b}
                    initial={false}
                    animate={{ opacity: step > i ? 1 : 0, x: step > i ? 0 : -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between"
                  >
                    <span>{b}</span>
                    <span className="text-leaf-400">PASS</span>
                  </motion.li>
                ))}
              </ul>

              {/* progress + verdict */}
              <div className="absolute inset-x-4 bottom-4">
                <div className="mb-1.5 flex items-center justify-between text-[10px]">
                  <span className={ready ? 'text-gold-400' : 'text-white/50'}>
                    {ready ? 'READY TO SHIP' : 'Testing…'}
                    {!ready && (
                      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                        ▌
                      </motion.span>
                    )}
                  </span>
                  <span className="text-white/50">
                    {Math.min(step, BENCH.length)}/{BENCH.length}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-leaf-400 to-gold-500"
                    animate={{ width: `${(Math.min(step, BENCH.length) / BENCH.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                </div>
              </div>

              {/* sweeping scan line */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-emerald-300/10 to-transparent"
                animate={{ y: ['-40px', '320px'] }}
                transition={{ duration: 3.2, ease: 'linear', repeat: Infinity }}
              />
              {/* light passing across the lid */}
              <span
                aria-hidden
                className="fc-anim pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                style={{ animation: 'fc-sweep 7s ease-in-out 2s infinite' }}
              />
              {/* glass reflection */}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* BASE */}
          <div className="relative mx-auto h-3.5 w-full rounded-b-[1.4rem] bg-gradient-to-b from-[#d9dcdf] to-[#aeb3b8] shadow-xl">
            <span className="absolute left-1/2 top-0 h-1.5 w-24 -translate-x-1/2 rounded-b-lg bg-[#8b9095]" />
          </div>
        </motion.div>
      </motion.div>

      {/* connector lines from screen to holo panels */}
      <svg
        aria-hidden
        viewBox="0 0 400 200"
        className="fc-anim pointer-events-none absolute inset-x-0 -top-14 hidden h-40 w-full overflow-visible sm:block"
      >
        <path
          d="M130 20 L150 80"
          stroke="#90c030"
          strokeOpacity=".5"
          strokeDasharray="3 5"
          fill="none"
          style={{ animation: 'fc-dash 5s linear infinite' }}
        />
        <path
          d="M290 8 L260 80"
          stroke="#f06c0c"
          strokeOpacity=".5"
          strokeDasharray="3 5"
          fill="none"
          style={{ animation: 'fc-dash 6s linear infinite' }}
        />
        <circle className="fc-node" cx="150" cy="80" r="3" fill="#90c030" />
        <circle className="fc-node" cx="260" cy="80" r="3" fill="#f06c0c" style={{ animationDelay: '1s' }} />
      </svg>

      {/* holographic panels rising from the screen */}
      <motion.div
        aria-hidden
        className={`${holo} -top-8 left-[26%] border-leaf-500/30`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { delay: 1.5, duration: 0.8 },
          scale: { delay: 1.5, duration: 0.8, ease: EASE },
          y: { duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 1.5 },
        }}
      >
        <p className="font-mono text-[9px] text-leaf-700">CPU LOAD</p>
        <div className="mt-1.5 flex h-8 items-end gap-1">
          {[40, 70, 55, 90, 65, 80].map((h, i) => (
            <motion.i
              key={i}
              className="block w-full rounded-sm bg-gradient-to-t from-leaf-500 to-gold-500"
              animate={{ height: [`${h * 0.5}%`, `${h}%`, `${h * 0.5}%`] }}
              transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </motion.div>
      <motion.div
        aria-hidden
        className={`${holo} -top-12 right-[16%] border-gold-500/30`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, 9, 0] }}
        transition={{
          opacity: { delay: 1.8, duration: 0.8 },
          scale: { delay: 1.8, duration: 0.8, ease: EASE },
          y: { duration: 7, ease: 'easeInOut', repeat: Infinity, delay: 1.8 },
        }}
      >
        <p className="font-mono text-[9px] text-gold-700">SSD HEALTH</p>
        <svg viewBox="0 0 100 28" className="fc-anim mt-1.5 h-8 w-full">
          <polyline
            points="0,20 14,16 28,19 42,9 56,13 70,5 84,10 100,3"
            fill="none"
            stroke="#f06c0c"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
            style={{ animation: 'fc-dash 4s linear infinite' }}
          />
        </svg>
      </motion.div>

      {/* floating component icons */}
      <motion.span
        aria-hidden
        className={`${orb} left-[2%] top-[58%] text-gold-600 ring-gold-500/25`}
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
      >
        <Icon name="cpu" className="h-4 w-4" />
      </motion.span>
      <motion.span
        aria-hidden
        className={`${orb} bottom-[16%] right-[3%] text-leaf-700 ring-leaf-500/25`}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity, delay: 1 }}
      >
        <Icon name="monitor" className="h-4 w-4" />
      </motion.span>

      {/* floating chips (own depth layer so they drift against the laptop) */}
      <motion.div
        className={`${chip} -left-2 top-6 border-gold-500/30 text-gold-700 sm:-left-8`}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity }}
      >
        <Icon name="shield" className="h-4 w-4" /> {WARRANTY_MONTHS} month warranty
      </motion.div>
      <motion.div
        className={`${chip} -right-2 top-1/3 border-leaf-500/30 text-leaf-700 sm:-right-6`}
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 5.2, ease: 'easeInOut', repeat: Infinity, delay: 0.6 }}
      >
        <Icon name="cpu" className="h-4 w-4" /> i5 · 16GB · SSD
      </motion.div>
      <motion.div
        className={`${chip} bottom-4 left-4 border-gold-500/30 text-gold-700 sm:-left-2`}
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity, delay: 1.2 }}
      >
        <Icon name="check" className="h-4 w-4" /> Grade A
      </motion.div>
    </div>
  );
}

function Hero({ slides, active, setActive, shopLink }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const hasBanners = slides.length > 0;
  const current = hasBanners ? slides[active % slides.length] : null;
  const bannerLink = current?.link_url?.startsWith('/') ? current.link_url : shopLink;
  const go = (n) => setActive((n + slides.length) % slides.length);

  const trust = [
    { icon: 'truck', text: `Free UK delivery over ${FREE_DELIVERY_OVER}` },
    { icon: 'shield', text: `${WARRANTY_MONTHS} month warranty` },
    { icon: 'check', text: 'Tested before dispatch' },
  ];
  const highlights = [
    { label: 'From £20', accent: 'gold' },
    { label: 'Grade A & B', accent: 'leaf' },
    { label: 'Windows 11 Pro', accent: 'gold' },
  ];

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[78vh] flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(240,108,12,0.10),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(144,192,48,0.12),_transparent_32%),linear-gradient(135deg,_#fffaf5_0%,_#fff3e4_40%,_#f6fbf0_100%)] lg:min-h-[calc(100svh-230px)]"
    >
      {hasBanners ? (
        <>
          {slides.map((s, i) => (
            <motion.img
              key={s.id ?? i}
              src={assetUrl(s.image_path)}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-25 sm:object-right"
              animate={{ opacity: i === active ? 0.25 : 0, scale: i === active ? 1 : 1.06 }}
              transition={{ duration: 0.9, ease: EASE }}
            />
          ))}
          <Link to={bannerLink} aria-label="View offer" className="absolute inset-0 -z-10" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gold-50/85 lg:hidden" />
          <div className="pointer-events-none absolute inset-0 -z-10 hidden lg:block lg:bg-[linear-gradient(to_right,#fff3e4_0%,#fff3e4_34%,rgba(255,243,228,0.75)_46%,rgba(255,243,228,0)_60%)]" />
        </>
      ) : (
        <>
          <CircuitBg />
          <HeroDepth progress={scrollYProgress} />
        </>
      )}

      <motion.div
        aria-hidden
        style={{ y: glowY }}
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-leaf-400/30 blur-3xl"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-10 bottom-0 -z-10 h-64 w-64 rounded-full bg-gold-400/35 blur-3xl"
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-start gap-8 px-4 pb-12 pt-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:pb-8 lg:pt-8">
        {/* Copy */}
        <div className="max-w-2xl text-center lg:w-[51%] lg:max-w-[35rem] lg:shrink-0 lg:text-left xl:max-w-[38rem]">
          <Badge accent="leaf">Refurbished computers, tested in Burnley</Badge>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="mt-3 font-serif text-4xl leading-[0.98] tracking-[-0.04em] text-charcoal sm:text-5xl lg:text-[3.35rem]"
          >
            <span className="block">Premium refurbished tech,</span>
            <span className="block bg-gradient-to-r from-gold-600 via-gold-500 to-leaf-600 bg-clip-text text-transparent drop-shadow-[0_8px_20px_rgba(240,108,12,0.18)]">
              without the new-price shock.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
            className="mx-auto mt-4 max-w-xl text-sm text-charcoal-light sm:text-base lg:mx-0"
          >
            Dell, HP and Lenovo hardware — cleaned, tested and rebuilt before it reaches you, with the same
            reliability and a {WARRANTY_MONTHS} month back-up. 
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
            className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start"
          >
            {highlights.map((h) => (
              <li
                key={h.label}
                className={`rounded-full border bg-white/90 px-3.5 py-1.5 font-serif text-sm shadow-sm backdrop-blur-sm ${
                  h.accent === 'leaf' ? 'border-leaf-500/30 text-leaf-700' : 'border-gold-500/30 text-gold-700'
                }`}
              >
                {h.label}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.65 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Magnetic>
              <Link to={shopLink}>
                <Button variant="gold" size="lg" className="shimmer-sheen glow-card shadow-[0_16px_30px_rgba(240,108,12,0.25)] hover:-translate-y-0.5">
                  Shop all computers
                </Button>
              </Link>
            </Magnetic>
            <a
              href={STORE_PHONE_HREF}
              className={`inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-white px-5 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-500/50 hover:bg-gold-50 ${FOCUS}`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-white">
                <Icon name="phone" className="h-3.5 w-3.5" />
              </span>
              Call {STORE_PHONE}
            </a>
          </motion.div>

          {/* Hardware carried, straight from the catalogue's brand list. */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.8 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-charcoal/10 pt-4 lg:justify-start"
          >
            <span className="text-xs text-charcoal-light">We carry</span>
            {BRANDS.map((b, i) => (
              <span key={b.name} className="flex items-center gap-3">
                {i > 0 && <span className="text-charcoal/25" aria-hidden="true">·</span>}
                <span className="font-serif text-sm text-charcoal">{b.name}</span>
              </span>
            ))}
          </motion.div>

          <motion.ul
            variants={STAGGER}
            initial="hidden"
            animate="show"
            transition={{ delayChildren: 0.95 }}
            className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-charcoal-light lg:justify-start"
          >
            {trust.map((t, i) => (
              <motion.li key={t.text} variants={ITEM} className="flex items-center gap-1.5">
                <Icon name={t.icon} className={`h-4 w-4 ${i % 2 ? 'text-leaf-600' : 'text-gold-500'}`} />
                {t.text}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <HeroVideo />
      </div>

      {hasBanners && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous slide"
            className={`absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-charcoal/10 bg-white/80 text-charcoal shadow-sm backdrop-blur transition hover:bg-gold-500 hover:text-white sm:flex ${FOCUS}`}
          >
            <Icon name="left" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next slide"
            className={`absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-charcoal/10 bg-white/80 text-charcoal shadow-sm backdrop-blur transition hover:bg-gold-500 hover:text-white sm:flex ${FOCUS}`}
          >
            <Icon name="right" className="h-4 w-4" />
          </button>
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 w-10 overflow-hidden rounded-full bg-charcoal/15 ${FOCUS}`}
              >
                {i < active && <span className="block h-full w-full bg-gold-500" />}
                {i === active && (
                  <motion.span
                    key={active}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: SLIDE_INTERVAL_MS / 1000, ease: 'linear' }}
                    className="block h-full w-full origin-left bg-gold-500"
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ═══════════════ Categories ═══════════════ */
function Categories({ categories }) {
  if (!categories.length) return null;
  return (
    <section id="categories" className={`scroll-mt-40 py-10 ${BG_FRESH}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          title="Shop by category"
          subtitle="Desktops, laptops, screens and complete setups — all tested and ready to ship across the UK."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <Reveal key={cat.slug} variant="scale" delay={i * 0.06}>
              <TiltCard>
                <Link
                  to={`/onlineshop?category=${cat.slug}`}
                  className={`group relative block aspect-[16/10] overflow-hidden rounded-2xl border border-charcoal/5 bg-cream-dark shadow-sm transition-shadow hover:shadow-xl ${FOCUS}`}
                >
                  {cat.banner_image ? (
                    <>
                      <img
                        src={assetUrl(cat.banner_image)}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-full" />
                    </>
                  ) : (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length]
                      }`}
                    >
                      {/* Sheen that sweeps across the tile on hover. */}
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                      <span className="absolute right-5 top-5 text-white/40 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-white/70">
                        <CategoryIcon slug={cat.slug} className="h-16 w-16" strokeWidth={1.2} />
                      </span>
                    </div>
                  )}
                  {/* Scrim kept to the lower third so the photograph reads as a photograph;
                      it only has to carry the title and the one-line description. */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 via-45% to-transparent transition-opacity duration-500 group-hover:from-charcoal/90" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                    <div>
                      <span className="mb-2 block h-1 w-8 rounded-full bg-gold-500 transition-all duration-500 group-hover:w-16" />
                      <h3 className="font-serif text-xl text-white sm:text-2xl">{cat.name}</h3>
                      {cat.description && (
                        <p className="mt-1 line-clamp-2 max-w-xs text-xs text-white/90">{cat.description}</p>
                      )}
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-charcoal shadow-lg transition duration-300 group-hover:-rotate-45 group-hover:bg-gold-500 group-hover:text-white">
                      <Icon name="arrow" className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ Spotlight ═══════════════ */
function Spotlight({ product }) {
  if (!product) return null;

  const price = Number(product.min_price ?? product.base_price);
  const compareAt = product.compare_at_price ? Number(product.compare_at_price) : null;
  const saving = compareAt && compareAt > price ? compareAt - price : null;
  const inStock = Number(product.total_stock) > 0;

  return (
    <section className="bg-leaf-100/70 px-4 py-10 sm:px-6">
      <Reveal variant="scale">
        {/* Conic brand glow rotating behind the card, showing as a 2px ring.
            It must be square and clipped: rotating a wide element sweeps its corners
            outside the card, which bled a large diagonal wash across the page. */}
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl p-[2px]">
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-70 [background:conic-gradient(from_0deg,#90c030,#f06c0c,#90c030)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 14, ease: 'linear', repeat: Infinity }}
          />
          <div className="relative grid overflow-hidden rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-white via-gold-50 to-leaf-50 shadow-sm md:grid-cols-2">
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-16 h-60 w-60 rounded-full bg-leaf-400/25 blur-3xl"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-16 h-60 w-60 rounded-full bg-gold-400/25 blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 11, ease: 'easeInOut', repeat: Infinity }}
          />

          {/* Artwork */}
          <Link
            to={`/product/${product.slug}`}
            className={`group relative order-1 flex min-h-[260px] items-center justify-center overflow-hidden p-8 md:order-2 ${FOCUS}`}
          >
            {product.primary_image ? (
              /* Product shots come in with a white background baked in, which floats
                 oddly on the tinted card. Sitting it on a white panel makes that
                 deliberate rather than accidental. */
              <div className="relative flex h-56 w-full max-w-sm items-center justify-center rounded-2xl bg-white p-6 shadow-lg ring-1 ring-charcoal/5 transition-transform duration-500 group-hover:-translate-y-1">
                <img
                  src={assetUrl(product.primary_image)}
                  alt={product.name}
                  className="max-h-full w-auto object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ) : (
              <span className="relative flex flex-col items-center text-gold-500/70">
                <CategoryIcon slug={product.category_slug} className="h-28 w-28" strokeWidth={1} />
                <span className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-charcoal-light/70">
                  {product.category_name}
                </span>
              </span>
            )}
          </Link>

          {/* Copy */}
          <div className="relative order-2 flex flex-col justify-center p-6 sm:p-10 md:order-1">
            <Badge accent="leaf">Pick of the range</Badge>

            <h2 className="mt-3 font-serif text-2xl leading-tight text-charcoal sm:text-3xl">{product.name}</h2>

            {product.description && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-charcoal-light">{product.description}</p>
            )}

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="font-serif text-3xl text-charcoal">{formatCurrency(price)}</span>
              {compareAt && compareAt > price && (
                <span className="text-sm text-charcoal-light line-through">{formatCurrency(compareAt)}</span>
              )}
              {saving && (
                <span className="rounded-full bg-gold-500 px-2.5 py-1 text-xs font-medium text-white">
                  Save {formatCurrency(saving)}
                </span>
              )}
            </div>

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-charcoal-light">
              <li className="flex items-center gap-1.5">
                <Icon name="shield" className="h-4 w-4 text-leaf-600" />
                {WARRANTY_MONTHS} month warranty
              </li>
              <li className="flex items-center gap-1.5">
                <Icon name="check" className="h-4 w-4 text-leaf-600" />
                Windows 11 Pro installed
              </li>
              <li className="flex items-center gap-1.5">
                <Icon name="truck" className="h-4 w-4 text-gold-500" />
                {inStock ? 'In stock, ships in 48h' : 'Currently out of stock'}
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Magnetic>
                <Link to={`/product/${product.slug}`}>
                  <Button variant="gold" size="lg">View this machine</Button>
                </Link>
              </Magnetic>
              <Link to={LINKS.shop}>
                <Button variant="outline" size="lg">Compare the range</Button>
              </Link>
            </div>
          </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ═══════════════ Brands ═══════════════ */
function Brands({ shopLink }) {
  return (
    <section className={`border-y border-gold-500/15 py-10 ${BG_WARM}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="Trusted hardware"
          badgeAccent="leaf"
          title="The brands we carry"
          subtitle="Ex-corporate hardware built to last, plus our own custom gaming builds."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BRANDS.map((b, i) => (
            <Reveal key={b.name} variant="up" delay={i * 0.06}>
              <Link
                to={`${shopLink}?search=${encodeURIComponent(b.name)}`}
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-charcoal/5 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${FOCUS}`}
              >
                {/* Brand colour floods up from the foot on hover. */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 translate-y-full bg-gradient-to-br transition-transform duration-500 ease-out group-hover:translate-y-0 ${
                    i % 2 ? 'from-leaf-500 to-leaf-700' : 'from-gold-500 to-gold-700'
                  }`}
                />
                <p className="relative font-serif text-2xl leading-none text-charcoal transition-colors duration-300 group-hover:text-white">
                  {b.name}
                </p>
                <p className="relative mt-1.5 text-xs text-charcoal-light transition-colors duration-300 group-hover:text-white/85">
                  {b.note}
                </p>
                <span
                  className={`relative mt-4 h-1 w-8 rounded-full transition-all duration-500 group-hover:w-16 group-hover:bg-white ${
                    i % 2 ? 'bg-leaf-500' : 'bg-gold-500'
                  }`}
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ Products (Featured / New arrivals tabs) ═══════════════ */
function ProductsShowcase({ featured, featuredLoading, newArrivals, newArrivalsLoading, viewAllLink }) {
  const [tab, setTab] = useState('featured');
  const tabs = [
    { key: 'featured', label: 'Featured' },
    { key: 'new', label: 'New arrivals' },
  ];
  const items = tab === 'featured' ? featured : newArrivals;
  const loading = tab === 'featured' ? featuredLoading : newArrivalsLoading;
  const skeletons = tab === 'featured' ? 12 : 8;
  const grid = 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4';

  return (
    <section className={`py-10 ${BG_WARM}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <SectionHeading title="Ready to ship today" />
          <div
            role="tablist"
            className="mb-4 flex rounded-full border border-gold-500/20 bg-white p-1 shadow-sm"
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${FOCUS} ${
                  tab === t.key ? 'text-white' : 'text-charcoal-light hover:text-charcoal'
                }`}
              >
                {tab === t.key && (
                  <motion.span
                    layoutId="products-tab"
                    transition={SPRING}
                    className="absolute inset-0 -z-10 rounded-full bg-gold-500"
                  />
                )}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {loading ? (
              <div className={grid}>
                {Array.from({ length: skeletons }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : items?.length ? (
              <motion.div variants={STAGGER} initial="hidden" animate="show" className={grid}>
                {items.map((product) => (
                  <motion.div key={product.id} variants={ITEM} whileHover={{ y: -6, transition: SPRING }}>
                    <TiltCard max={4}>
                      <ProductCard product={product} />
                    </TiltCard>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="py-8 text-center text-charcoal-light">Stock coming soon.</p>
            )}
          </motion.div>
        </AnimatePresence>

        <Reveal className="mt-5 text-center">
          <Link to={viewAllLink}>
            <Button variant="outline" size="lg">
              View all products
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ Stats ═══════════════ */
function StatCounter({ value, suffix = '', label, accent, icon }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [n, setN] = useState(0);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => setLanded(true),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: EASE }}
      whileHover={{ y: -4 }}
      className="group rounded-2xl border border-charcoal/5 bg-white px-3 py-5 text-center shadow-sm transition-shadow hover:shadow-lg"
    >
      <span
        className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${
          accent === 'leaf' ? 'bg-leaf-500/12 text-leaf-700' : 'bg-gold-500/12 text-gold-600'
        }`}
      >
        <Icon name={icon} className="h-5 w-5" />
      </span>
      {/* A small pop as the number settles, so the band does not just sit still. */}
      <motion.p
        animate={landed ? { scale: [1, 1.08, 1] } : undefined}
        transition={{ duration: 0.45, ease: EASE }}
        className="font-serif text-3xl tabular-nums text-charcoal sm:text-4xl"
      >
        {n.toLocaleString()}
        <span className={accent === 'leaf' ? 'text-leaf-600' : 'text-gold-500'}>{suffix}</span>
      </motion.p>
      <p className="mt-0.5 text-xs text-charcoal-light sm:text-sm">{label}</p>
    </motion.div>
  );
}

function StatsSection() {
  return (
    <section className="relative overflow-hidden border-y border-charcoal/5 bg-gradient-to-br from-leaf-100 via-cream-dark to-gold-100 py-10">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/4 top-0 h-40 w-72 rounded-full bg-leaf-400/30 blur-3xl"
        animate={{ x: [-40, 40, -40] }}
        transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-1/4 bottom-0 h-40 w-72 rounded-full bg-gold-400/30 blur-3xl"
        animate={{ x: [40, -40, 40] }}
        transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
      />
      <Particles count={10} />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:px-6 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <StatCounter key={s.label} {...s} accent={i % 2 ? 'leaf' : 'gold'} />
        ))}
      </div>
    </section>
  );
}

/* ═══════════════ Condition grades ═══════════════ */
function Grades({ link }) {
  const [key, setKey] = useState(GRADES[0].key);
  const g = GRADES.find((x) => x.key === key);

  return (
    <section className={`py-10 ${BG_WARM}`}>
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 md:grid-cols-2">
        <div>
          <SectionHeading
            badge="Buy with confidence"
            title="What the condition grades mean"
            subtitle="The grade describes how a machine looks, never how it performs. Everything is tested to the same standard."
          />

          <div className="flex flex-wrap gap-2">
            {GRADES.map((x) => (
              <button
                key={x.key}
                type="button"
                onClick={() => setKey(x.key)}
                aria-pressed={key === x.key}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${FOCUS} ${
                  key === x.key
                    ? 'border-gold-500 bg-gold-500 text-white'
                    : 'border-charcoal/15 bg-white text-charcoal hover:border-gold-500/50 hover:bg-gold-50'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-4"
            >
              <p className="text-sm text-charcoal-light">{g.text}</p>
              <ul className="mt-3 space-y-1.5">
                {g.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-charcoal">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <Link to={link} className="mt-5 inline-block">
            <Button variant="gold">Browse the range</Button>
          </Link>
        </div>

        <Reveal variant="right">
          <div className="rounded-3xl border border-leaf-500/20 bg-white p-6 shadow-md">
            <p className="text-xs font-medium uppercase tracking-wide text-gold-600">Cosmetic condition</p>
            <p className="mt-1 font-serif text-3xl text-charcoal">{g.tone}</p>

            <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-leaf-50 ring-1 ring-charcoal/8">
              <motion.div
                key={key}
                initial={{ width: 0 }}
                animate={{ width: `${g.fill * 100}%` }}
                transition={{ duration: 0.7, ease: EASE }}
                className="h-full rounded-full bg-gradient-to-r from-leaf-500 to-gold-500"
              />
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4">
              {[
                ['Warranty', `${WARRANTY_MONTHS} months`],
                ['Returns', `${RETURN_DAYS} days`],
                ['Operating system', 'Windows 11 Pro'],
                ['Testing', 'Every unit'],
              ].map(([k, v], idx) => (
                <div
                  key={k}
                  className={`rounded-xl p-3 shadow-sm ${idx % 2 ? 'bg-leaf-50' : 'bg-gold-50'}`}
                >
                  <dt className="text-xs text-charcoal-light">{k}</dt>
                  <dd className="font-serif text-xl text-charcoal">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ Why buy refurbished (bento) ═══════════════ */
function Tile({ className = '', delay = 0, children }) {
  return (
    <motion.div
      variants={REVEAL.up}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Why() {
  return (
    <section className={`border-y border-leaf-500/15 py-10 ${BG_FRESH}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="The case for refurbished"
          badgeAccent="leaf"
          title="Why buy refurbished"
          subtitle="Corporate hardware is built to a higher standard than consumer kit — and costs a fraction of new."
        />
        <div className="grid gap-3 md:grid-cols-6">
          <Tile className="border border-charcoal/5 bg-white shadow-sm md:col-span-4">
            <div className="relative z-10 max-w-sm pr-0 sm:pr-24">
              <h3 className="font-serif text-lg text-charcoal sm:text-xl">Every machine is bench-tested</h3>
              <p className="mt-1 text-sm text-charcoal-light">
                Memory, storage health, thermals and ports are all checked under load before a machine is listed.
                Anything that fails is repaired or stripped for parts rather than sold on.
              </p>
            </div>
            <div aria-hidden className="absolute -right-6 top-1/2 h-36 w-36 -translate-y-1/2 sm:right-4">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className={`absolute rounded-full border-2 border-transparent ${
                    i % 2 ? 'border-t-leaf-400' : 'border-t-gold-400'
                  }`}
                  style={{ inset: i * 16 }}
                  animate={{ rotate: i % 2 ? -360 : 360 }}
                  transition={{ duration: 6 + i * 3, ease: 'linear', repeat: Infinity }}
                />
              ))}
              <span className="absolute inset-[48px] rounded-full bg-gold-500/15" />
            </div>
          </Tile>

          <Tile delay={0.08} className="bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-sm md:col-span-2">
            <motion.span
              aria-hidden
              className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity }}
            />
            <p className="relative font-serif text-5xl leading-none">{WARRANTY_MONTHS}</p>
            <p className="relative mt-0.5 font-serif text-base">month warranty as standard</p>
            <p className="relative mt-0.5 text-xs text-white/85">Return-to-base cover on every machine we sell.</p>
          </Tile>

          {WHY.map((w, i) => (
            <Tile
              key={w.title}
              delay={0.05 + i * 0.05}
              className="border border-charcoal/5 bg-white shadow-sm md:col-span-3"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    w.accent === 'leaf' ? 'bg-leaf-500/12 text-leaf-700' : 'bg-gold-500/12 text-gold-600'
                  }`}
                >
                  <Icon name={w.icon} className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="font-serif text-base text-charcoal">{w.title}</h3>
                  <p className="mt-0.5 text-xs text-charcoal-light sm:text-sm">{w.text}</p>
                </div>
              </div>
            </Tile>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ Services ═══════════════ */
function Services() {
  return (
    <section className={`py-10 ${BG_WARM}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="More than a shop"
          title="What else we do"
          subtitle="We are a workshop as well as a store — come to us with the machine you already own."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} variant="up" delay={i * 0.08}>
              <div
                className={`h-full rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                  s.accent === 'leaf' ? 'border-leaf-500/25' : 'border-gold-500/25'
                }`}
              >
                <motion.span
                  whileHover={{ rotate: -8, scale: 1.12 }}
                  transition={SPRING}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${
                    s.accent === 'leaf' ? 'bg-leaf-500' : 'bg-gold-500'
                  }`}
                >
                  <Icon name={s.icon} className="h-5 w-5" />
                </motion.span>
                <h3 className="mt-3 font-serif text-lg text-charcoal">{s.title}</h3>
                <p className="mt-1 text-sm text-charcoal-light">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ shared: typewriter hook + OS-style window frame ═══════════════ */
function useTyped(text, active = true, speed = 14) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (!active) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setN(text.length);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);
  return text.slice(0, n);
}

function Caret({ className = '' }) {
  return (
    <motion.span
      aria-hidden
      className={`ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[2px] ${className}`}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.9, repeat: Infinity }}
    />
  );
}

function Win({ title, children, dark = false, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border shadow-xl ${
        dark ? 'border-[#1d3a2b] bg-[#0d1f17]' : 'border-charcoal/10 bg-white'
      } ${className}`}
    >
      <div
        className={`flex items-center gap-3 border-b px-3 py-2 ${
          dark ? 'border-white/10 bg-[#12281d]' : 'border-charcoal/8 bg-cream-dark'
        }`}
      >
        <span className="flex gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className={`truncate font-mono text-[11px] ${dark ? 'text-white/50' : 'text-charcoal-light'}`}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ═══════════════ Visit us: map window + live order tracker ═══════════════ */
const COLLECT_STEPS = ['Order placed', 'Tested & set up', 'Ready to collect'];

function Visit() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setStep((s) => (s + 1) % (COLLECT_STEPS.length + 1)), step === COLLECT_STEPS.length ? 2600 : 1300);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <section className={`border-y border-leaf-500/15 py-10 ${BG_FRESH}`}>
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 md:grid-cols-2">
        <div>
          <SectionHeading
            badge="Find us"
            badgeAccent="leaf"
            title="Visit the Burnley unit"
            subtitle="Come and see a machine before you buy, collect an online order, or bring something in for repair."
          />
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
                <Icon name="pin" className="h-4.5 w-4.5" />
              </span>
              <span className="text-sm text-charcoal">
                {STORE_ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-500/20 text-leaf-700">
                <Icon name="phone" className="h-4.5 w-4.5" />
              </span>
              <a href={STORE_PHONE_HREF} className={`text-sm font-medium text-charcoal hover:underline ${FOCUS}`}>
                {STORE_PHONE}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
                <Icon name="mail" className="h-4.5 w-4.5" />
              </span>
              <a href={STORE_EMAIL_HREF} className={`text-sm font-medium text-charcoal hover:underline ${FOCUS}`}>
                {STORE_EMAIL}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={STORE_MAP_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="gold">Get directions</Button>
            </a>
            <Link to={LINKS.contact}>
              <Button variant="outline">Contact us</Button>
            </Link>
          </div>
        </div>

        <Reveal variant="right">
          <Win title="maps · firstclick-burnley">
            {/* map */}
            <div className="relative h-52 overflow-hidden bg-leaf-50 sm:h-60">
              <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
                <defs>
                  <pattern id="mapgrid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M24 0H0V24" fill="none" className="stroke-leaf-500/15" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="400" height="240" fill="url(#mapgrid)" />
                <path d="M-10 170 C80 150 120 90 220 110 S360 60 420 40" fill="none" stroke="white" strokeWidth="14" />
                <path d="M200 -10 C190 60 210 160 180 250" fill="none" stroke="white" strokeWidth="10" />
                <path d="M-10 60 H420" fill="none" stroke="white" strokeWidth="6" />
                <path d="M-10 170 C80 150 120 90 220 110 S360 60 420 40" fill="none" className="stroke-gold-500/60" strokeWidth="1.5" strokeDasharray="6 8" />
              </svg>

              {/* delivery dot driving along the main road */}
              <motion.span
                aria-hidden
                className="absolute h-2.5 w-2.5 rounded-full bg-leaf-600 ring-4 ring-leaf-500/25"
                initial={{ left: '-3%', top: '70%' }}
                animate={{ left: ['-3%', '30%', '55%', '103%'], top: ['70%', '55%', '46%', '17%'] }}
                transition={{ duration: 7, ease: 'linear', repeat: Infinity }}
              />

              {/* pin + radar */}
              <div className="absolute left-[53%] top-[45%] -translate-x-1/2 -translate-y-1/2">
                {[0, 1].map((i) => (
                  <motion.span
                    key={i}
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold-500"
                    initial={{ scale: 0.2, opacity: 0.8 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 2.4, ease: 'easeOut', repeat: Infinity, delay: i * 1.2 }}
                  />
                ))}
                <motion.span
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-white shadow-lg"
                >
                  <Icon name="pin" className="h-5 w-5" />
                </motion.span>
              </div>

              <span className="absolute bottom-2 left-3 rounded-md bg-white/90 px-2 py-1 font-mono text-[10px] text-charcoal shadow-sm">
                Burnley unit · open for collection
              </span>
            </div>

            {/* order tracker */}
            <div className="p-4 sm:p-5">
              <p className="font-serif text-lg text-charcoal">Click and collect</p>
              <p className="mt-0.5 text-xs text-charcoal-light">
                Order online, collect from the unit, usually the same working day.
              </p>
              <ol className="mt-4 grid grid-cols-3 gap-2">
                {COLLECT_STEPS.map((s, i) => {
                  const done = step > i;
                  return (
                    <li key={s} className="text-center">
                      <div className="relative mx-auto mb-2 h-1.5 overflow-hidden rounded-full bg-charcoal/10">
                        <motion.span
                          className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-leaf-500 to-gold-500"
                          initial={false}
                          animate={{ scaleX: done ? 1 : 0 }}
                          transition={{ duration: 0.5, ease: EASE }}
                        />
                      </div>
                      <motion.span
                        animate={{ color: done ? '#1f2a24' : '#8a928d' }}
                        className="flex items-center justify-center gap-1 text-[11px] font-medium sm:text-xs"
                      >
                        {done && <Icon name="check" className="h-3.5 w-3.5 text-leaf-600" />}
                        {s}
                      </motion.span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Win>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ Reviews: mail-client inbox with typed review ═══════════════ */
function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((n) => (n + 1) % TESTIMONIALS.length), 8000);
    return () => clearTimeout(t);
  }, [paused, i]);

  const t = TESTIMONIALS[i];
  const typed = useTyped(t.quote, true, 12);
  const done = typed.length >= t.quote.length;

  return (
    <section className={`py-10 ${BG_WARM}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          title="What our customers say"
          subtitle="Homes, offices and schools across the North West on buying refurbished from us."
        />

        <Reveal variant="scale">
          <Win title={`inbox · ${TESTIMONIALS.length} customer reviews`}>
            <div className="grid md:grid-cols-[15rem_1fr]">
              {/* message list */}
              <div className="flex gap-1 overflow-x-auto border-b border-leaf-700/30 bg-leaf-600 p-2 md:flex-col md:border-b-0 md:border-r">
                {TESTIMONIALS.map((x, idx) => (
                  <button
                    key={x.name}
                    type="button"
                    onClick={() => setI(idx)}
                    aria-current={idx === i}
                    className={`relative flex min-w-[11rem] items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left transition-colors md:min-w-0 ${FOCUS} ${
                      idx === i ? 'bg-white/20 shadow-sm ring-1 ring-white/40' : 'hover:bg-white/10'
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 font-serif text-sm font-semibold text-white shadow-sm">
                      {x.name[0]}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">{x.name}</span>
                      <span className="block truncate text-xs text-white/75">{x.location} · 5 stars</span>
                    </span>
                    {idx === i && !paused && (
                      <motion.span
                        key={`${i}-bar`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 8, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-gold-400"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* reading pane */}
              <div className="relative min-h-[260px] bg-gradient-to-br from-gold-50 via-white to-leaf-50 p-5 sm:p-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-charcoal/8 pb-3">
                      <div>
                        <p className="font-serif text-lg text-charcoal">Review from {t.name}</p>
                        <p className="font-mono text-[11px] text-charcoal-light">
                          {t.location}, UK · verified purchase
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <motion.span
                            key={s}
                            initial={{ opacity: 0, scale: 0.3, rotate: -40 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ ...SPRING, delay: 0.15 + s * 0.07 }}
                          >
                            <Star className="h-4 w-4 fill-gold-500" />
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    <p className="mt-4 min-h-[7.5rem] font-serif text-lg leading-relaxed text-charcoal sm:text-xl">
                      {typed}
                      {!done && <Caret className="bg-gold-500" />}
                    </p>

                    <motion.p
                      initial={false}
                      animate={{ opacity: done ? 1 : 0, y: done ? 0 : 6 }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-leaf-500/12 px-3 py-1 text-xs font-medium text-leaf-700"
                    >
                      <Icon name="check" className="h-3.5 w-3.5" /> Would buy again
                    </motion.p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Win>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ FAQ: terminal, answers are typed out ═══════════════ */
function FaqAnswer({ text }) {
  const typed = useTyped(text, true, 9);
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="overflow-hidden"
    >
      <p className="pb-3 pl-5 pr-4 font-mono text-xs leading-relaxed text-emerald-300 sm:text-[13px]">
        {typed}
        {typed.length < text.length && <Caret className="bg-emerald-300" />}
      </p>
    </motion.div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className={`border-t border-leaf-500/15 py-10 ${BG_FRESH}`}>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_1.7fr]">
        <div>
          <SectionHeading title="Questions, answered" subtitle="The essentials before you order." />
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-2xl border border-leaf-500/20 bg-white p-4 shadow-sm">
              <motion.span
                aria-hidden
                className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gold-400/25 blur-xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
              />
              <p className="relative font-serif text-base text-charcoal">Need a hand choosing?</p>
              <p className="relative mt-0.5 text-xs text-charcoal-light">
                Tell us what you need the machine for and we will point you at the right spec.
              </p>
              <a
                href={STORE_PHONE_HREF}
                className={`relative mt-3 inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-600 ${FOCUS}`}
              >
                <Icon name="phone" className="h-4 w-4" />
                {STORE_PHONE}
              </a>
              <div className="relative mt-3 flex flex-wrap gap-4 text-sm">
                <Link to={LINKS.contact} className="font-medium text-leaf-700 hover:underline">
                  Contact us
                </Link>
                <Link to={LINKS.faq} className="font-medium text-leaf-700 hover:underline">
                  All FAQs
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal variant="right">
          <Win title="firstclick — faq" dark>
            <div className="relative px-1 py-3">
              {/* faint scanline sweeping down the terminal */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-emerald-300/[0.06] to-transparent"
                animate={{ y: ['-60px', '560px'] }}
                transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
              />
              <p className="px-4 pb-2 font-mono text-[11px] text-white/40">
                firstclick --help · click a question to run it
              </p>

              {FAQS.map((f, idx) => {
                const isOpen = open === idx;
                return (
                  <div key={f.q} className="border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      className={`group flex w-full items-start gap-2 px-4 py-2.5 text-left ${FOCUS}`}
                    >
                      <motion.span
                        animate={{ x: isOpen ? 3 : 0, color: isOpen ? '#f5a524' : '#6b8f7b' }}
                        className="font-mono text-sm"
                      >
                        {isOpen ? '▸' : '$'}
                      </motion.span>
                      <span
                        className={`font-mono text-xs transition-colors sm:text-[13px] ${
                          isOpen ? 'text-white' : 'text-white/70 group-hover:text-white'
                        }`}
                      >
                        {f.q}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>{isOpen && <FaqAnswer text={f.a} />}</AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Win>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ Final CTA ═══════════════ */
const CTA_CMD = 'shop --grade A,B --warranty 12';
const CTA_LINES = [
  'Windows 11 Pro installed',
  `${WARRANTY_MONTHS} month warranty`,
  `Free UK delivery over ${FREE_DELIVERY_OVER}`,
  'Ships from Burnley in 48h',
];

/* One run of the terminal demo; parent remounts it (via key) to loop. */
function CtaTerminal({ onDone }) {
  const typed = useTyped(CTA_CMD, true, 45);
  const typedDone = typed.length >= CTA_CMD.length;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!typedDone) return;
    const t = setTimeout(
      () => (n < CTA_LINES.length ? setN(n + 1) : onDone()),
      n < CTA_LINES.length ? 550 : 3000
    );
    return () => clearTimeout(t);
  }, [typedDone, n, onDone]);

  return (
    <div className="min-h-[11.5rem] p-4 font-mono text-xs text-emerald-300 sm:text-[13px]">
      <p>
        <span className="text-gold-400">$</span> <span className="text-white">{typed}</span>
        {!typedDone && <Caret className="bg-emerald-300" />}
      </p>
      <ul className="mt-3 space-y-1.5">
        {CTA_LINES.map((l, i) => (
          <motion.li
            key={l}
            initial={false}
            animate={{ opacity: n > i ? 1 : 0, x: n > i ? 0 : -10 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <span className="text-leaf-400">✓</span> {l}
          </motion.li>
        ))}
      </ul>
      <motion.p
        initial={false}
        animate={{ opacity: n >= CTA_LINES.length ? 1 : 0 }}
        className="mt-4 text-gold-400"
      >
        Ready. Press Enter <Caret className="bg-gold-400" />
      </motion.p>
    </div>
  );
}

function FinalCta({ promoBanner, link }) {
  const target = promoBanner?.link_url?.startsWith('/') ? promoBanner.link_url : link;
  const [run, setRun] = useState(0);

  // decorative keycaps floating in the background
  const keys = [
    { t: 'Esc', cls: 'left-[6%] top-[14%]', d: 0 },
    { t: 'Ctrl', cls: 'left-[14%] bottom-[10%]', d: 0.8 },
    { t: 'Alt', cls: 'right-[48%] top-[8%] hidden lg:flex', d: 1.4 },
    { t: '⌘', cls: 'right-[6%] bottom-[12%]', d: 0.4 },
  ];

  return (
    <section className={`px-4 py-10 sm:px-6 ${BG_WARM}`}>
      <Reveal
        variant="scale"
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-gold-500 via-gold-500 to-leaf-500 px-5 py-10 sm:px-10 lg:py-14"
      >
        <Particles count={12} color="#ffffff" />
        {/* moving sheen */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['0%', '450%'] }}
          transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
        />
        <motion.span
          aria-hidden
          className="absolute -bottom-12 -right-8 h-52 w-52 rounded-full bg-white/15"
          animate={{ scale: [1, 1.15, 1], y: [0, -12, 0] }}
          transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        />
        {keys.map((k) => (
          <motion.span
            key={k.t}
            aria-hidden
            className={`pointer-events-none absolute flex h-11 min-w-[2.75rem] items-center justify-center rounded-lg border-b-4 border-white/25 bg-white/15 px-2 font-mono text-xs text-white/70 backdrop-blur-sm ${k.cls}`}
            animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: k.d }}
          >
            {k.t}
          </motion.span>
        ))}

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-medium text-white">
              <Icon name="truck" className="h-3.5 w-3.5" />
              Free UK delivery over {FREE_DELIVERY_OVER}
            </span>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight text-white sm:text-4xl">
              {promoBanner?.title || 'Find the right machine for the job'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base lg:mx-0">
              Desktops, laptops, gaming PCs, monitors and complete dual screen setups — all tested, all covered by a{' '}
              {WARRANTY_MONTHS} month warranty, all ready to ship from Burnley.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              {/* keycap button: presses itself every few seconds, presses for real on click */}
              <Magnetic>
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 3.6 }}
                >
                  <Link
                    to={target}
                    className={`inline-flex items-center gap-3 rounded-2xl border-b-[5px] border-charcoal/25 bg-white px-6 py-3.5 text-sm font-semibold text-charcoal shadow-xl transition-all hover:bg-cream-dark active:translate-y-1 active:border-b-[1px] ${FOCUS}`}
                  >
                    Shop the range
                    <span className="flex h-6 items-center rounded-md bg-charcoal px-2 font-mono text-[10px] text-white">
                      Enter ↵
                    </span>
                  </Link>
                </motion.div>
              </Magnetic>
              <a
                href={STORE_PHONE_HREF}
                className={`inline-flex items-center gap-2 rounded-2xl border border-white/50 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/15 ${FOCUS}`}
              >
                <Icon name="phone" className="h-4 w-4" />
                {STORE_PHONE}
              </a>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <Win title="firstclick — checkout" dark className="shadow-2xl">
              <CtaTerminal key={run} onDone={() => setRun((r) => r + 1)} />
            </Win>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ═══════════════ Main Home ═══════════════ */
export default function Home() {
  const { data: heroBanners } = useAsync(() => getBanners('home_hero'), []);
  const { data: secondaryBanners } = useAsync(() => getBanners('home_secondary'), []);
  const { data: promoBanners } = useAsync(() => getBanners('home_promo'), []);
  const { data: featured, loading: featuredLoading } = useAsync(async () => {
    const featuredList = (await getFeaturedProducts(12)) || [];
    if (featuredList.length >= 12) return featuredList;
    const { data: latest } = await getProducts({ limit: 12, sort: 'newest' });
    const merged = [...featuredList];
    for (const p of latest || []) {
      if (merged.length >= 12) break;
      if (!merged.find((m) => m.id === p.id)) merged.push(p);
    }
    return merged;
  }, []);
  const { data: newArrivals, loading: newArrivalsLoading } = useAsync(async () => {
    const { data } = await getProducts({ limit: 8, sort: 'newest' });
    return data;
  }, []);
  const { data: categories } = useAsync(() => getCategories(), []);
  const promoBanner = promoBanners?.[0];

  const slides = [...(heroBanners || []), ...(secondaryBanners || [])].filter((b) => b.image_path);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setTimeout(() => setActiveSlide((i) => (i + 1) % slides.length), SLIDE_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [slides.length, activeSlide]);

  const topCategories = (categories || []).filter((c) => !c.parent_id);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-cream-dark">
        <style>{FX_CSS}</style>
        <ScrollProgress />
        <BackToTop />

        <Hero slides={slides} active={activeSlide} setActive={setActiveSlide} shopLink={LINKS.shop} />

        {/* Solid brand strip right under the hero */}
        <section className="border-y border-gold-600/30 bg-gold-500 py-2.5">
          <Marquee items={MARQUEE_ITEMS} speed={45} light />
        </section>

        <Categories categories={topCategories} />

        {/* Real stock with real prices is the most persuasive thing on the page,
            so it comes straight after the categories rather than behind the spotlight. */}
        <ProductsShowcase
          featured={featured}
          featuredLoading={featuredLoading}
          newArrivals={newArrivals}
          newArrivalsLoading={newArrivalsLoading}
          viewAllLink={LINKS.shop}
        />

        <Spotlight product={featured?.[0]} />

        <Brands shopLink={LINKS.shop} />
        <StatsSection />
        <Grades link={LINKS.shop} />
        <Why />
        <Services />
        <Visit />
        <Testimonials />
        <FAQ />
        <FinalCta promoBanner={promoBanner} link={LINKS.shop} />
      </div>
    </MotionConfig>
  );
}