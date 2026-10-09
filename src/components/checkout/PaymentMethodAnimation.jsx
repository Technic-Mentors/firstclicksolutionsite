import { AnimatePresence, motion } from 'framer-motion';

export default function PaymentMethodAnimation({ method, productImage }) {
  return (
    <div className="relative mt-6 h-40 overflow-hidden rounded-xl border border-gold-500/15 bg-gold-50/40">
      <AnimatePresence mode="wait">
        {method === 'bank_transfer' ? (
          <motion.div
            key="bank"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <BankTransferScene />
          </motion.div>
        ) : (
          <motion.div
            key="cod"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <CodScene productImage={productImage} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// One shared 8s cycle, broken into phases (as fractions of the cycle):
//   0.00 -> 0.25  courier walks in from off-screen to the meeting spot
//   0.25 -> 0.30  courier waits, door opens, resident starts stepping out
//   0.30 -> 0.45  resident walks out of the house to the meeting spot
//   0.45 -> 0.55  exchange: package fades from courier to resident, cash appears in courier's hand
//   0.55 -> 0.68  resident carries the package back to the house
//   0.68 -> 0.80  resident (and the door) fade back to "inside"
//   0.75 -> 0.97  courier turns and walks back off-screen with the payment
//   0.97 -> 1.00  brief hold before the cycle loops
const CYCLE = 8;
const COURIER_STOP_X = 150;
const RESIDENT_STOP_X = 185;
const DOOR_X = 250;
const OFFSCREEN_X = -20;

function CodScene({ productImage }) {
  return (
    <svg viewBox="-30 0 350 160" className="h-full w-full" aria-hidden>
      <defs>
        <clipPath id="codPackageClip">
          <rect x="-10" y="97" width="20" height="18" rx="2" />
        </clipPath>
      </defs>
      <line x1="20" y1="130" x2="300" y2="130" stroke="#f06c0c" strokeOpacity="0.2" strokeWidth="2" />

      {/* ── House (bigger) ── */}
      <g transform="translate(200,20)" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 110 V50 L50 0 L100 50 V110 Z" />
        <path d="M35 110 V70 H65 V110" />
        {/* door panel: solid while closed, fades away while the resident is outside */}
        <motion.rect
          x="37"
          y="72"
          width="26"
          height="38"
          fill="#57534e"
          fillOpacity="0.5"
          stroke="none"
          animate={{ opacity: [1, 1, 0, 0, 1, 1] }}
          transition={{ duration: CYCLE, repeat: Infinity, ease: 'linear', times: [0, 0.3, 0.34, 0.75, 0.8, 1] }}
        />
      </g>

      {/* ── Courier ── */}
      <motion.g
        stroke="#f06c0c"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{
          x: [OFFSCREEN_X, COURIER_STOP_X, COURIER_STOP_X, OFFSCREEN_X, OFFSCREEN_X],
          y: [0, -4, 0, -4, 0],
        }}
        transition={{
          x: { duration: CYCLE, repeat: Infinity, ease: 'linear', times: [0, 0.25, 0.75, 0.97, 1] },
          y: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <circle cx="0" cy="83" r="7" fill="#f06c0c" stroke="none" />
        <path d="M0 90 V102" />
        <path d="M0 102 V122" />
        <path d="M0 108 L-10 118 M0 108 L10 118" />
        <path d="M0 122 L-8 132 M0 122 L8 132" />

        {/* the package — held until the exchange, then handed over */}
        <motion.g
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: CYCLE, repeat: Infinity, ease: 'linear', times: [0, 0.45, 0.55, 1] }}
        >
          {productImage ? (
            <image
              href={productImage}
              x="-10"
              y="97"
              width="20"
              height="18"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#codPackageClip)"
            />
          ) : (
            <rect x="-10" y="97" width="20" height="18" rx="2" fill="#fff" />
          )}
          <rect x="-10" y="97" width="20" height="18" rx="2" fill="none" stroke="#1c1917" strokeWidth="1.4" />
        </motion.g>

        {/* cash received in exchange for the package */}
        <motion.g
          animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
          transition={{ duration: CYCLE, repeat: Infinity, ease: 'linear', times: [0, 0.45, 0.55, 0.9, 0.95, 1] }}
        >
          <circle cx="14" cy="106" r="7" fill="#2f8f4e" stroke="none" />
          <text x="14" y="109" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">
            £
          </text>
        </motion.g>

        <g>
          <rect x="-42" y="55" width="84" height="15" rx="7.5" fill="#ffffff" stroke="#f06c0c" strokeWidth="1.2" />
          <text
            x="0"
            y="65.5"
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="600"
            fill="#1c1917"
            stroke="none"
            fontFamily="Georgia, serif"
          >
            First Click Solutions
          </text>
        </g>
      </motion.g>

      {/* ── Resident: steps out, takes the package, carries it back inside ── */}
      <motion.g
        stroke="#1c1917"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{
          x: [DOOR_X, DOOR_X, RESIDENT_STOP_X, RESIDENT_STOP_X, DOOR_X, DOOR_X],
          opacity: [0, 0, 1, 1, 0, 0],
        }}
        transition={{
          x: { duration: CYCLE, repeat: Infinity, ease: 'linear', times: [0, 0.3, 0.45, 0.6, 0.75, 1] },
          opacity: { duration: CYCLE, repeat: Infinity, ease: 'linear', times: [0, 0.3, 0.34, 0.75, 0.8, 1] },
        }}
      >
        <circle cx="0" cy="83" r="7" fill="#57534e" stroke="none" />
        <path d="M0 90 V102" />
        <path d="M0 102 V122" />
        <path d="M0 108 L-10 118 M0 108 L10 118" />
        <path d="M0 122 L-8 132 M0 122 L8 132" />

        {/* the package, once handed over */}
        <motion.g
          animate={{ opacity: [0, 0, 1, 1] }}
          transition={{ duration: CYCLE, repeat: Infinity, ease: 'linear', times: [0, 0.45, 0.55, 1] }}
        >
          {productImage ? (
            <image
              href={productImage}
              x="-10"
              y="97"
              width="20"
              height="18"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#codPackageClip)"
            />
          ) : (
            <rect x="-10" y="97" width="20" height="18" rx="2" fill="#fff" />
          )}
          <rect x="-10" y="97" width="20" height="18" rx="2" fill="none" stroke="#1c1917" strokeWidth="1.4" />
        </motion.g>
      </motion.g>
    </svg>
  );
}

function BankTransferScene() {
  return (
    <svg viewBox="0 0 320 160" className="h-full w-full" aria-hidden>
      <g transform="translate(30,60)" stroke="#1c1917" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="0" y="0" width="48" height="32" rx="4" />
        <line x1="0" y1="10" x2="48" y2="10" strokeWidth="4" stroke="#f06c0c" />
      </g>

      <g transform="translate(240,55)" stroke="#1c1917" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 40 H50" />
        <path d="M4 40 V20 M14 40 V20 M25 40 V20 M36 40 V20 M46 40 V20" />
        <path d="M-4 20 L25 2 L54 20 Z" />
      </g>

      <motion.line
        x1="85"
        y1="76"
        x2="235"
        y2="76"
        stroke="#f06c0c"
        strokeOpacity="0.3"
        strokeWidth="2"
        strokeDasharray="6 6"
        animate={{ strokeDashoffset: [0, -24] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />

      <motion.g
        animate={{ x: [85, 220], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.85, 1] }}
      >
        <circle cy="76" r="9" fill="#f06c0c" />
        <text x="0" y="80" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
          Rs
        </text>
      </motion.g>
    </svg>
  );
}
