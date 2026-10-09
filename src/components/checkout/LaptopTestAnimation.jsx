import { motion, useReducedMotion } from 'framer-motion';

const CYCLE = 9;
const INK = '#1c1917';
const ORANGE = '#f06c0c';
const GREEN = '#90c030';

// Keyboard grid: four rows of keys that light up in a wave, as if being tested.
const ROWS = [
  { y: 92, count: 13 },
  { y: 101, count: 12 },
  { y: 110, count: 11 },
  { y: 119, count: 8 },
];
const KEY_W = 8.5;
const KEY_H = 6.5;
const GAP = 1.6;

/**
 * Line-art SVG in the same style as the delivery and account animations: a laptop
 * boots, its screen runs a check, and the keyboard is swept key by key before a tick
 * lands — the bench test every machine goes through, drawn rather than photographed.
 */
export default function LaptopTestAnimation() {
  const reduce = useReducedMotion();
  const loop = (extra = {}) => (reduce ? {} : { repeat: Infinity, duration: CYCLE, ease: 'linear', ...extra });

  return (
    <svg
      viewBox="0 0 300 142"
      className="w-full"
      role="img"
      aria-label="A laptop being bench-tested: the screen runs a check and each key is swept before it passes."
    >
      {/* ── Desk line ── */}
      <line x1="20" y1="136" x2="280" y2="136" stroke={ORANGE} strokeOpacity="0.25" strokeWidth="2" />

      {/* ── Screen ── */}
      <g>
        <rect x="78" y="22" width="144" height="86" rx="5" fill="#ffffff" stroke={INK} strokeWidth="2" />
        <rect x="84" y="28" width="132" height="74" rx="3" fill="#fbfbfa" stroke="none" />

        {/* Scanline sweeping the panel */}
        <motion.rect
          x="84"
          width="132"
          height="12"
          fill={GREEN}
          fillOpacity="0.18"
          stroke="none"
          animate={reduce ? {} : { y: [28, 90, 28] }}
          transition={loop({ ease: 'easeInOut' })}
        />

        {/* Check lines typing out, one after another */}
        {[0, 1, 2].map((i) => (
          <motion.rect
            key={i}
            x="92"
            y={40 + i * 13}
            height="4"
            rx="2"
            fill={INK}
            fillOpacity="0.35"
            initial={{ width: 0 }}
            animate={reduce ? { width: 70 } : { width: [0, 0, 70, 70, 0] }}
            transition={loop({
              times: [0, 0.08 + i * 0.07, 0.2 + i * 0.07, 0.78, 0.86],
              ease: 'easeOut',
            })}
          />
        ))}

        {/* Progress bar filling as the test runs */}
        <rect x="92" y="84" width="116" height="6" rx="3" fill={INK} fillOpacity="0.08" stroke="none" />
        <motion.rect
          x="92"
          y="84"
          height="6"
          rx="3"
          fill={ORANGE}
          initial={{ width: 0 }}
          animate={reduce ? { width: 116 } : { width: [0, 116, 116, 0] }}
          transition={loop({ times: [0.05, 0.55, 0.85, 0.9], ease: 'easeInOut' })}
        />

        {/* Pass tick, once the bar is full */}
        <motion.g
          animate={reduce ? { opacity: 1, scale: 1 } : { opacity: [0, 0, 1, 1, 0], scale: [0.6, 0.6, 1, 1, 0.8] }}
          transition={loop({ times: [0, 0.55, 0.64, 0.84, 0.9] })}
          style={{ transformOrigin: '196px 40px' }}
        >
          <circle cx="196" cy="40" r="9" fill={GREEN} stroke="none" />
          <path d="M191.5 40l3 3 6-6" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      </g>

      {/* ── Base and keyboard ── */}
      <g>
        <path d="M62 108h176l10 20H52z" fill="#ffffff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />

        {ROWS.map((row, r) => {
          const total = row.count * KEY_W + (row.count - 1) * GAP;
          const startX = 150 - total / 2;
          return row.count > 0
            ? Array.from({ length: row.count }).map((_, k) => {
                const order = (r * 13 + k) / 44;
                return (
                  <motion.rect
                    key={`${r}-${k}`}
                    x={startX + k * (KEY_W + GAP)}
                    y={row.y}
                    width={KEY_W}
                    height={KEY_H}
                    rx="1.6"
                    stroke={INK}
                    strokeOpacity="0.25"
                    strokeWidth="0.8"
                    fill={ORANGE}
                    animate={reduce ? { fillOpacity: 0.12 } : { fillOpacity: [0, 0.75, 0.08, 0.08] }}
                    transition={loop({
                      times: [
                        Math.min(0.9, 0.08 + order * 0.45),
                        Math.min(0.93, 0.12 + order * 0.45),
                        Math.min(0.96, 0.2 + order * 0.45),
                        1,
                      ],
                      ease: 'easeOut',
                    })}
                  />
                );
              })
            : null;
        })}

        {/* Trackpad */}
        <rect x="132" y="127" width="36" height="1.5" rx="0.75" fill={INK} fillOpacity="0.2" stroke="none" />
      </g>

    </svg>
  );
}
