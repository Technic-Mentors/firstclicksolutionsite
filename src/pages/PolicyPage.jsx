import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAsync } from '../hooks/useAsync';
import { getPublicSettings } from '../api/settings.api';
import Spinner from '../components/ui/Spinner';
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

export default function PolicyPage() {
  const { data: settings, loading } = useAsync(() => getPublicSettings(), []);

  const returnWindow = settings?.return_window_days || 7;

  return (
    <div>
      {/* ══════════════ HERO — Sunlit Gradient ══════════════ */}
      <section className="relative isolate overflow-hidden bg-gold-500 text-white">
        <PageHeroBg />

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <nav className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/75">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span className="text-white/50">/</span>
            <span className="font-medium text-white">Shipping &amp; Returns</span>
          </nav>

          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/70" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85">
              Policy &amp; Information
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/70" />
          </div>

          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            Shipping &amp; <span className="text-white">Returns</span>
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm text-white/85 sm:text-base">
            Everything you need to know about delivery, returns and your 12 month warranty.
          </p>

          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>
      </section>

      {/* ══════════════ CONTENT ══════════════ */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="space-y-5"
          >
            {/* ── Shipping ── */}
            <motion.div
              variants={fadeUp}
              className="group relative overflow-hidden rounded-xl border border-gold-500/15 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7"
            >
              <span className="absolute inset-y-5 left-0 w-0.5 bg-gradient-to-b from-gold-400 to-gold-600" />

              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-600">
                  <TruckIcon />
                </span>
                <div className="flex-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                    Delivery
                  </span>
                  <h2 className="mt-0.5 font-serif text-xl text-charcoal sm:text-2xl">Shipping</h2>
                  <div className="mt-3 space-y-2 text-sm leading-relaxed text-charcoal-light">
                    <p>
                      Delivery to UK mainland addresses is{' '}
                      <strong className="text-charcoal">free on orders over £250</strong>, and charged at a flat
                      rate below that. The rate is shown at checkout before you pay.
                    </p>
                    <p>
                      Orders are typically dispatched within{' '}
                      <strong className="text-charcoal">48 hours</strong> and arrive on a tracked courier service.
                      The Scottish Highlands, Northern Ireland and offshore addresses may take a little longer.
                    </p>
                    <p>
                      You are also welcome to{' '}
                      <strong className="text-charcoal">collect from our Burnley unit</strong> — often the same
                      working day. Call ahead on 01282 421306 and we will have it ready and running.
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <InfoPill label="Free over £250" />
                    <InfoPill label="Dispatched in 48h" />
                    <InfoPill label="Click &amp; collect" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Returns ── */}
            <motion.div
              variants={fadeUp}
              className="group relative overflow-hidden rounded-xl border border-gold-500/15 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7"
            >
              <span className="absolute inset-y-5 left-0 w-0.5 bg-gradient-to-b from-gold-400 to-gold-600" />

              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-600">
                  <ReturnIcon />
                </span>
                <div className="flex-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                    Peace of Mind
                  </span>
                  <h2 className="mt-0.5 font-serif text-xl text-charcoal sm:text-2xl">Returns</h2>
                  <div className="mt-3 space-y-2 text-sm leading-relaxed text-charcoal-light">
                    <p>
                      {settings?.return_policy_text ||
                        `Items can be returned within ${returnWindow} days of delivery if unused and in original packaging.`}
                    </p>
                    <p>
                      To start a return, contact us with your order number and reason. Once we confirm eligibility,
                      we&apos;ll arrange the pickup or provide return instructions.
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <InfoPill label={`${returnWindow}-day window`} />
                    <InfoPill label="Unused condition" />
                    <InfoPill label="Original packaging" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Warranty ── */}
            <motion.div
              variants={fadeUp}
              className="group relative overflow-hidden rounded-xl border border-gold-500/15 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7"
            >
              <span className="absolute inset-y-5 left-0 w-0.5 bg-gradient-to-b from-leaf-400 to-leaf-600" />

              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-leaf-500/10 text-leaf-700">
                  <ShieldIcon />
                </span>
                <div className="flex-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-leaf-700">
                    Covered
                  </span>
                  <h2 className="mt-0.5 font-serif text-xl text-charcoal sm:text-2xl">Warranty</h2>
                  <div className="mt-3 space-y-2 text-sm leading-relaxed text-charcoal-light">
                    <p>
                      All refurbished hardware is covered by a{' '}
                      <strong className="text-charcoal">12 month return-to-base warranty</strong> from the date of
                      delivery. If a fault develops, contact us and we will arrange repair or replacement.
                    </p>
                    <p>
                      Return-to-base means you send the machine back to us (or bring it in to the Burnley unit) and
                      we cover the repair. The warranty covers hardware faults, not accidental damage, liquid
                      damage, or software problems caused after delivery.
                    </p>
                    <p>
                      Your statutory rights under the Consumer Rights Act 2015 apply in addition to this warranty
                      and are not affected by it.
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <InfoPill label="12 months" />
                    <InfoPill label="Return to base" />
                    <InfoPill label="Hardware faults" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* ══════════════ FINAL CTA — no background, matches About/Contact/FAQ/Offers/SizeGuide ══════════════ */}
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
              Still Have Questions?
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-500/60" />
          </div>

          <h2 className="font-serif text-2xl leading-tight text-charcoal sm:text-3xl lg:text-4xl">
            Our Team is Here to <span className="text-gold-600">Help</span>
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal-light sm:text-base">
            Call 01282 421306 or email info@firstclicksolutions.co.uk — before, during or after your order.
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

/* ═══════════════ Helpers ═══════════════ */
function InfoPill({ label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/20 bg-gold-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-gold-700">
      <span className="h-1 w-1 rounded-full bg-gold-500" />
      {label}
    </span>
  );
}

function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" />
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="18.5" cy="18.5" r="2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}