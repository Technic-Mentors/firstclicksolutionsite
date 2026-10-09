import { motion } from 'framer-motion';

export default function CheckoutNudge() {
  return (
    <div className="mt-2 flex items-center gap-4 rounded-lg border border-gold-500/15 bg-gold-50/40 p-4">
      <svg viewBox="0 0 100 120" className="h-24 w-20 shrink-0" aria-hidden>
        <g stroke="#1c1917" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="22" r="9" fill="#f06c0c" stroke="none" />
          <path d="M50 31 V70" />
          <path d="M50 42 L36 55 M50 42 L64 55" />
          <path d="M50 70 L40 108" />
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M50 70 L60 108" />
          </motion.g>
        </g>
      </svg>

      <div className="flex-1">
        <p className="flex items-center gap-1.5 font-serif text-sm text-charcoal">
          Your order is ready and waiting!
          <ClockIcon />
        </p>
        <p className="mt-0.5 text-xs text-charcoal-light">Complete checkout before stock runs out.</p>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" className="shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="#f06c0c" strokeWidth="2" />
      <motion.line
        x1="12"
        y1="12"
        x2="12"
        y2="6.5"
        stroke="#f06c0c"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ transformOrigin: '12px 12px' }}
        animate={{ rotate: [0, 0, 90, 90, 180, 180, 270, 270, 360] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear',
          times: [0, 0.22, 0.25, 0.47, 0.5, 0.72, 0.75, 0.97, 1],
        }}
      />
      <line x1="12" y1="12" x2="15.5" y2="12" stroke="#f06c0c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
