import { motion, useReducedMotion } from 'framer-motion';
import { STORE_PHONE, STORE_PHONE_HREF } from '../../config/site';
import LaptopTestAnimation from './LaptopTestAnimation';

const EASE = [0.22, 1, 0.36, 1];

const POINTS = [
  { icon: 'shield', title: '12 month warranty', text: 'Return-to-base cover on every machine.', accent: 'leaf' },
  { icon: 'rotate', title: '14 day returns', text: 'Unused and in its original packaging.', accent: 'gold' },
  { icon: 'check', title: 'Tested and data-wiped', text: 'Bench-tested before it was ever listed.', accent: 'leaf' },
  { icon: 'pin', title: 'Collect from Burnley', text: 'Often ready the same working day.', accent: 'gold' },
];

const ICONS = {
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  rotate: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 22s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="11" r="2.5" />
    </>
  ),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
};

function Icon({ name, className = 'h-4 w-4' }) {
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

/**
 * Fills the empty left column under the delivery animation at checkout.
 *
 * The step-2 layout left a tall gap below the animation while the order summary on
 * the right ran much longer. This puts the hero artwork and the four promises that
 * matter most in that space — right where someone is deciding whether to press
 * Place Order.
 */
export default function CheckoutReassurance() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
      className="relative mt-6 overflow-hidden rounded-2xl border border-charcoal/5 bg-gradient-to-br from-leaf-50 via-white to-gold-50 p-6 shadow-sm sm:p-7"
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-leaf-400/25 blur-3xl"
        animate={reduce ? {} : { scale: [1, 1.12, 1] }}
        transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-gold-400/25 blur-3xl"
        animate={reduce ? {} : { scale: [1, 1.15, 1] }}
        transition={{ duration: 11, ease: 'easeInOut', repeat: Infinity }}
      />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-leaf-500/30 bg-leaf-500/10 px-2.5 py-1 text-xs font-medium text-leaf-700">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-current"
            animate={reduce ? {} : { opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Almost there
        </span>

        <h3 className="mt-3 font-serif text-xl leading-snug text-charcoal sm:text-2xl">
          Every machine is checked before it ships
        </h3>

        {/* Drawn rather than photographed, so it sits with the delivery and account
            illustrations elsewhere in checkout. */}
        <div className="mx-auto my-4 w-full max-w-sm">
          <LaptopTestAnimation />
        </div>

        <div className="space-y-3">
          {POINTS.map(({ icon, title, text, accent }) => {
            const theme =
              accent === 'leaf'
                ? 'border-leaf-500/20 bg-leaf-500/5 text-leaf-700'
                : 'border-gold-500/20 bg-gold-500/5 text-gold-700';

            return (
              <div
                key={title}
                className="flex items-start gap-3 rounded-xl border border-charcoal/5 bg-white/70 p-3 shadow-sm"
              >
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${theme}`}>
                  <Icon name={icon} className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-charcoal">{title}</p>
                  <p className="text-xs text-charcoal-light">{text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <a
          href={STORE_PHONE_HREF}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-charcoal/10 bg-charcoal px-3.5 py-2 text-sm font-medium text-white transition hover:bg-charcoal/90"
        >
          <Icon name="phone" className="h-4 w-4" />
          Call {STORE_PHONE}
        </a>
      </div>
    </motion.div>
  );
}
