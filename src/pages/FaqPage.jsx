import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../components/ui/Button';
import PageHeroBg from '../components/layout/PageHeroBg';

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const FAQS = [
  {
    q: 'What does "refurbished" actually mean here?',
    a: 'Every machine is stripped down, cleaned, data-wiped and bench-tested. Faulty parts are replaced, thermal paste is renewed where needed, and a fresh activated copy of Windows 11 Pro is installed before it is listed for sale.',
  },
  {
    q: 'What is the difference between Grade A and Grade B?',
    a: 'The grade describes cosmetic condition only, never performance. Grade A has little to no visible wear; Grade B has light scuffs or scratches on the casing. Both are tested to the same standard and carry the same warranty.',
  },
  {
    q: 'What warranty do I get?',
    a: 'All refurbished hardware comes with a 12 month return-to-base warranty. If a fault develops, contact us and we will arrange repair or replacement.',
  },
  {
    q: 'How much is delivery, and how long does it take?',
    a: 'UK mainland delivery is free on orders over £250, and charged at a flat rate below that. Orders usually leave us within 48 hours. You are also welcome to collect from our Burnley unit, often the same working day.',
  },
  {
    q: 'Can I return something if it is not right?',
    a: 'Yes — you have 14 days from delivery to return an item unused and in its original packaging. Get in touch and we will arrange it.',
  },
  {
    q: 'Which machine should I choose?',
    a: 'For office and home admin, a refurbished desktop or SFF machine is plenty. For tight spaces, look at mini computers. For gaming or content creation, choose one of our dedicated-graphics builds. If you are unsure, call us and tell us what you need it for.',
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
    q: 'Can you upgrade or repair a machine I already own?',
    a: 'Yes. We handle memory, storage, graphics and power supply upgrades, plus diagnostics and repair. Bring it in to the Burnley unit or call us first to describe the fault.',
  },
  {
    q: 'Who do I contact if something is wrong?',
    a: 'Call us on 01282 421306, email info@firstclicksolutions.co.uk, or send a message through our Contact page and we will come back to you.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div>
      {/* ══════════════ HERO — Sunlit Gradient ══════════════ */}
      <section className="relative isolate overflow-hidden bg-gold-500 text-white">
        <PageHeroBg />

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <nav className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/75">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span className="text-white/50">/</span>
            <span className="font-medium text-white">FAQ</span>
          </nav>

          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/70" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85">
              Help Center
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/70" />
          </div>

          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            Frequently Asked <span className="text-white">Questions</span>
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm text-white/85 sm:text-base">
            Quick answers on condition grades, warranty, delivery, returns and choosing the right machine.
          </p>

          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>
      </section>

      {/* ══════════════ FAQ ACCORDION ══════════════ */}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-3"
        >
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`group overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 ${
                  isOpen
                    ? 'border-gold-500/40 shadow-md'
                    : 'border-gold-500/15 hover:border-gold-500/30'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gold-50/40 sm:px-6 sm:py-5"
                >
                  <span className="flex items-start gap-3.5">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-300 ${
                        isOpen
                          ? 'bg-gold-500 text-charcoal'
                          : 'bg-gold-500/10 text-gold-600 group-hover:bg-gold-500/20'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`font-serif text-base leading-snug transition-colors sm:text-lg ${
                        isOpen ? 'text-gold-600' : 'text-charcoal'
                      }`}
                    >
                      {faq.q}
                    </span>
                  </span>

                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                      isOpen
                        ? 'border-gold-500 bg-gold-500 text-charcoal'
                        : 'border-gold-500/30 bg-gold-50 text-gold-600'
                    }`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      {isOpen ? (
                        <path d="M5 12h14" />
                      ) : (
                        <>
                          <path d="M12 5v14" />
                          <path d="M5 12h14" />
                        </>
                      )}
                    </svg>
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gold-500/15 px-5 pb-5 pt-4 pl-[3.25rem] sm:px-6 sm:pl-[3.75rem]">
                        <p className="text-sm leading-relaxed text-charcoal-light">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
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
              Still Need Help?
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-500/60" />
          </div>

          <h2 className="font-serif text-2xl leading-tight text-charcoal sm:text-3xl lg:text-4xl">
            Couldn&apos;t Find Your <span className="text-gold-600">Answer?</span>
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal-light sm:text-base">
            Call 01282 421306 or drop us a message — we are happy to talk through what you need before you buy.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/contact">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button variant="gold" size="lg">Contact Support</Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}