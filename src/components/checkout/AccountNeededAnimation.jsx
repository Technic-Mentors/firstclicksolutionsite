import { motion } from 'framer-motion';

// One shared cycle, broken into phases (as fractions of the cycle):
//   0.00 -> 0.28  shopper walks in from off-screen up to the gate
//   0.28 -> 0.34  tries the gate — a quick "denied" jitter on the lock
//   0.34 -> 0.55  the lock pops open and fades, the barrier arm lifts
//   0.55 -> 0.85  shopper walks through, on to delivery & payment
//   0.85 -> 1.00  barrier lowers and the lock resets for the next loop
const CYCLE = 7;
const TIMES = [0, 0.28, 0.34, 0.4, 0.55, 0.85, 0.95, 1];
const GATE_X = 160;
const STOP_X = 100;
const THROUGH_X = 300;
const START_X = -20;

export default function AccountNeededAnimation() {
  return (
    <div className="relative mt-4 h-64 overflow-hidden rounded-xl border border-gold-500/15 bg-gold-50/40">
      <svg viewBox="0 0 320 230" className="h-full w-full" aria-hidden>
        {/* ground line */}
        <line x1="10" y1="182" x2="310" y2="182" stroke="#f06c0c" strokeOpacity="0.2" strokeWidth="2" />

        {/* destination marker: delivery & payment, waiting past the gate */}
        <g transform="translate(280,140)" stroke="#1c1917" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-15" y="0" width="30" height="24" rx="3" fill="#fff" />
          <path d="M-15 8 H15" />
        </g>

        {/* ── Post + barrier arm (lifts once "unlocked") ── */}
        <g transform={`translate(${GATE_X},0)`}>
          <line x1="0" y1="100" x2="0" y2="182" stroke="#1c1917" strokeWidth="5" strokeLinecap="round" />
          <motion.g
            animate={{ rotate: [0, 0, 0, 0, -78, -78, 0, 0] }}
            transition={{ duration: CYCLE, repeat: Infinity, ease: 'easeInOut', times: TIMES }}
            style={{ transformOrigin: '0px 104px' }}
          >
            <rect x="-78" y="99" width="78" height="9" rx="4" fill="#f06c0c" />
            <rect x="-78" y="99" width="13" height="9" fill="#fff" fillOpacity="0.7" />
            <rect x="-52" y="99" width="13" height="9" fill="#fff" fillOpacity="0.7" />
            <rect x="-26" y="99" width="13" height="9" fill="#fff" fillOpacity="0.7" />

            {/* padlock hanging at the free end — jitters on "denied", pops open to unlock */}
            <motion.g
              transform="translate(-78,99)"
              animate={{ x: [0, 0, -3, 3, 0, 0, 0, 0] }}
              transition={{ duration: CYCLE, repeat: Infinity, ease: 'easeInOut', times: TIMES }}
            >
              <motion.g
                animate={{ rotate: [0, 0, 0, -35, -35, -35, 0, 0], opacity: [1, 1, 1, 0.6, 0, 0, 1, 1] }}
                transition={{ duration: CYCLE, repeat: Infinity, ease: 'easeInOut', times: TIMES }}
                style={{ transformOrigin: '5px 5px' }}
              >
                <path d="M-4 5 V-3 a6 6 0 0 1 12 0 V5" stroke="#1c1917" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              </motion.g>
              <rect x="-8" y="5" width="18" height="14" rx="2.5" fill="#1c1917" />
            </motion.g>
          </motion.g>
        </g>

        {/* ── Shopper: walks up, waits for the gate, then walks through ── */}
        <motion.g
          stroke="#f06c0c"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            x: [START_X, STOP_X, STOP_X, STOP_X, STOP_X, THROUGH_X, THROUGH_X, THROUGH_X],
            opacity: [1, 1, 1, 1, 1, 1, 1, 0],
          }}
          transition={{ duration: CYCLE, repeat: Infinity, ease: 'easeInOut', times: TIMES }}
        >
          <circle cx="0" cy="145" r="9" fill="#f06c0c" stroke="none" />
          <path d="M0 154 V170" />
          <path d="M0 170 V196" />
          <path d="M0 178 L-12 190 M0 178 L12 190" />
          <path d="M0 196 L-9 210 M0 196 L9 210" />
        </motion.g>
      </svg>

      <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-charcoal-light">
        Sign in unlocks delivery &amp; payment
      </p>
    </div>
  );
}
