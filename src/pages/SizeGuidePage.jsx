import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import PageHeroBg from '../components/layout/PageHeroBg';

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const SECTIONS = [
  {
    category: 'Condition Grades',
    groups: [
      {
        label: 'What the grade actually tells you',
        note: 'The grade describes cosmetic condition only — never performance. Every machine, whatever its grade, goes through the same testing and carries the same 12 month warranty.',
        headers: ['Grade', 'What to expect'],
        rows: [
          ['Grade A', 'Little to no visible wear. Near-indistinguishable from new.'],
          ['Grade B', 'Light scuffs or scratches on the casing. Identical internals and testing.'],
          ['Refurbished build', 'Our own build — a refurbished chassis fitted with new parts such as a GPU, PSU, memory or storage.'],
        ],
      },
    ],
  },
  {
    category: 'Which Machine',
    groups: [
      {
        label: 'Matching the form factor to the job',
        note: 'All seven categories run the same Windows 11 Pro install. The difference is size, expandability and graphics power.',
        headers: ['Type', 'Best for'],
        rows: [
          ['Refurbished Computers', 'Full-size tower. Office work, accounts, home study. Easiest to upgrade later.'],
          ['SFF Computers', 'Same performance, about a third of the volume. Tucks under a monitor.'],
          ['Mini Computers', 'One-litre micro desktop. Reception desks, kiosks, signage, tight spaces.'],
          ['Laptops', 'Ex-corporate Dell, HP and Lenovo. Hybrid working, coursework, travel.'],
          ['Gaming PCs', 'Dedicated graphics for 1080p and 1440p gaming, streaming and editing.'],
          ['Dual Screen Systems', 'Tower plus two matched monitors, cables and stands in one box.'],
          ['LCDs/LEDs', 'Single monitors or matched pairs, 19 inch to 27 inch.'],
        ],
      },
    ],
  },
  {
    category: 'Specification',
    groups: [
      {
        label: 'How much machine do you actually need?',
        note: 'Processor, memory and storage matter in that order for most people. If you are unsure, tell us what you will run and we will point you at the right spec.',
        headers: ['Use case', 'Suggested spec'],
        rows: [
          ['Browsing, email, office', 'i3 or i5 / 8GB RAM / 256GB SSD'],
          ['Accounts, multi-window, light CAD', 'i5 / 16GB RAM / 512GB SSD'],
          ['Heavy multitasking, dev work', 'i7 / 16–32GB RAM / 512GB–1TB SSD'],
          ['1080p gaming', 'i5 or i7 / 16GB RAM / GTX 1650 or better'],
          ['1440p gaming, streaming, editing', 'i7 / 16–32GB RAM / RTX 3060 or better'],
        ],
      },
    ],
  },
  {
    category: 'Jargon',
    groups: [
      {
        label: 'Plain-English glossary',
        note: 'The terms that show up most often on our product pages.',
        headers: ['Term', 'What it means'],
        rows: [
          ['SSD', 'Solid state drive. No moving parts — far faster to boot and open files than an old hard disk.'],
          ['NVMe', 'A faster type of SSD that plugs straight into the motherboard.'],
          ['RAM', 'Working memory. More RAM means more programs and browser tabs open at once.'],
          ['SFF', 'Small Form Factor — a compact desktop case.'],
          ['Return to base', 'For a warranty repair, the machine comes back to us and we cover the work.'],
        ],
      },
    ],
  },
  {
    category: 'Delivery & Collection',
    groups: [
      {
        label: 'How ordering works',
        note: 'Everything is tested and data-wiped before it leaves us, and the delivery cost is shown at checkout before you pay.',
        headers: ['Item', 'Detail'],
        rows: [
          ['Delivery', 'Free on UK mainland orders over £250'],
          ['Dispatch', 'Typically within 48 hours, on a tracked service'],
          ['Click & collect', 'From our Burnley unit, often the same working day'],
          ['Returns', '14 days from delivery, unused and in original packaging'],
          ['Warranty', '12 months, return to base'],
        ],
      },
    ],
  },
];

const HOW_TO_CHOOSE = [
  ['What will you run?', 'Office work and browsing are happy on an i5 with 8GB. Heavy multitasking, big spreadsheets or dev work want 16GB and an i7.'],
  ['How much space is there?', 'A full tower is easiest to upgrade. An SFF is a third of the size for the same performance, and a mini desktop will mount behind the monitor.'],
  ['Do you need graphics?', 'Only gaming, 3D and video editing need a dedicated graphics card. For everything else, the built-in graphics are plenty.'],
  ['Does cosmetic condition matter?', 'If the machine faces clients, choose Grade A. If it lives under a desk, Grade B performs identically for less.'],
];

export default function SizeGuidePage() {
  return (
    <div>
      {/* ══════════════ HERO — Sunlit Gradient ══════════════ */}
      <section className="relative isolate overflow-hidden bg-gold-500 text-white">
        <PageHeroBg />

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <nav className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/75">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span className="text-white/50">/</span>
            <span className="font-medium text-white">Buying Guide</span>
          </nav>

          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/70" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85">
              Before You Buy
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/70" />
          </div>

          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            Buying <span className="text-white">Guide</span>
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm text-white/85 sm:text-base">
            Condition grades, form factors, specifications and the jargon explained — so you can pick the right machine with confidence.
          </p>

          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>
      </section>

      {/* ══════════════ CONTENT ══════════════ */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* ── How to Choose ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative mb-8 overflow-hidden rounded-xl border border-gold-500/15 bg-white p-6 shadow-sm sm:p-7"
        >
          <span className="absolute inset-y-5 left-0 w-0.5 bg-gradient-to-b from-gold-400 to-gold-600" />

          <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
            <span className="h-px w-5 bg-gold-400" />
            Choosing the Right Machine
            <span className="h-px w-5 bg-gold-400" />
          </span>

          <h2 className="mt-1.5 font-serif text-xl text-charcoal sm:text-2xl">
            How to Choose
          </h2>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {HOW_TO_CHOOSE.map(([term, desc]) => (
              <div key={term} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <div>
                  <dt className="text-sm font-semibold text-charcoal">{term}</dt>
                  <dd className="text-xs leading-relaxed text-charcoal-light sm:text-sm">{desc}</dd>
                </div>
              </div>
            ))}
          </dl>
        </motion.div>

        {/* ── Category Sections ── */}
        {SECTIONS.map(({ category, groups }) => (
          <motion.div
            key={category}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/10 font-serif text-sm text-gold-600">
                {category[0]}
              </span>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Category
                </span>
                <h2 className="font-serif text-xl leading-tight text-charcoal sm:text-2xl">
                  {category}
                </h2>
              </div>
            </div>

            <div className="space-y-5">
              {groups.map((group) => (
                <motion.div
                  key={group.label}
                  variants={fadeUp}
                  className="overflow-hidden rounded-xl border border-gold-500/15 bg-white shadow-sm"
                >
                  <div className="border-b border-gold-500/15 bg-gold-50/40 px-5 py-4">
                    <h3 className="font-serif text-base text-charcoal sm:text-lg">
                      {group.label}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-charcoal-light sm:text-sm">
                      {group.note}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-max border-collapse text-sm">
                      <thead>
                        <tr className="bg-charcoal">
                          {group.headers.map((h) => (
                            <th
                              key={h}
                              className="border-b border-gold-500/20 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gold-400"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row, i) => (
                          <tr
                            key={i}
                            className="transition-colors duration-200 hover:bg-gold-50/50"
                          >
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className={`border-b border-stone-100 px-4 py-2.5 ${
                                  j === 0
                                    ? 'font-medium text-charcoal'
                                    : 'text-charcoal-light'
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="relative overflow-hidden bg-cream">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6"
        >
          <div className="mb-1 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-500/60" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-600">
              Need a Hand?
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-500/60" />
          </div>

          <h2 className="font-serif text-2xl leading-tight text-charcoal sm:text-3xl lg:text-4xl">
            Still Unsure What <span className="text-gold-600">You Need?</span>
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal-light sm:text-base">
            Tell us what you will use the machine for and we&apos;ll point you at the right spec — call 01282 421306 or drop us a message.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/contact">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button variant="gold" size="lg">Contact Us</Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}