import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  useInView,
} from 'framer-motion';
import { useAsync } from '../hooks/useAsync';
import { getPublicSettings } from '../api/settings.api';
import { submitContactMessage } from '../api/contact.api';
import { STORE_MAP_PLACE_URL, STORE_MAP_EMBED_URL } from '../config/mapLocation';
import { getErrorMessage } from '../utils/errorMessage';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import { STORE_ADDRESS, STORE_PHONE, STORE_EMAIL } from '../config/site';

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: 'spring', stiffness: 260, damping: 24, mass: 0.9 };
const SPRING_SOFT = { type: 'spring', stiffness: 160, damping: 22 };

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

/* ═══════════════ Reveal Words (hero only) ═══════════════ */
function RevealWords({ text, className = '', delay = 0, stagger = 0.08 }) {
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

/* ═══════════════ Main Contact Page ═══════════════ */
export default function ContactPage() {
  const { data: settings } = useAsync(() => getPublicSettings(), []);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const reduce = useReducedMotion();

  const address = settings?.store_address || STORE_ADDRESS;
  const phone = settings?.store_phone || STORE_PHONE;
  const email = settings?.store_email || STORE_EMAIL;

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroExitScale = useTransform(heroScroll, [0, 1], [1, 0.96]);
  const heroExitOpacity = useTransform(heroScroll, [0, 0.9], [1, 0]);
  const heroExitY = useTransform(heroScroll, [0, 1], [0, -32]);

  // Auto-reset the "sent" confirmation panel after a few seconds
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(false), 4000);
    return () => clearTimeout(t);
  }, [sent]);

  async function handleSubmit(e) {
    e.preventDefault();

    const name = form.name.trim();
    if (name.length < 2 || name.length > 25) {
      toast.error('Name must be between 2 and 25 characters.');
      return;
    }
    if (!/^[A-Za-z ]+$/.test(name)) {
      toast.error('Name can only contain letters and spaces.');
      return;
    }

    setSending(true);
    try {
      await submitContactMessage(form);
      toast.success("Thanks! We'll be in touch soon.");
      setForm({ name: '', email: '', message: '' });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not send your message. Please try again.'));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative">
      <ScrollProgressBar />

      {/* ══════════════ HERO — Compact Sunlit Gradient ══════════════ */}
      <section ref={heroRef} className="relative overflow-hidden bg-gold-500 text-white">
        <motion.div
          style={reduce ? {} : { scale: heroExitScale, opacity: heroExitOpacity, y: heroExitY }}
          className="absolute inset-0"
        >
          {/* Initial radial glow */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_28%,rgba(255,255,255,0.12),transparent_58%),radial-gradient(ellipse_at_82%_72%,rgba(0,0,0,0.08),transparent_58%)]"
          />

          {/* Drifting glow */}
          <motion.div
            aria-hidden
            animate={
              reduce
                ? {}
                : { x: ['-4%', '4%', '-4%'], y: ['-3%', '3%', '-3%'] }
            }
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -inset-20"
            style={{
              background:
                'radial-gradient(circle at 32% 38%, rgba(255,255,255,0.10), transparent 55%), radial-gradient(circle at 70% 62%, rgba(0,0,0,0.06), transparent 55%)',
              filter: 'blur(30px)',
            }}
          />

          {/* Grid overlay */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            transition={{ duration: 1.5, ease: EASE }}
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* Floating gold particles */}
          {!reduce && (
            <div className="pointer-events-none absolute inset-0">
              {[
                { left: '8%', top: '70%', s: 6, d: 12, del: 0 },
                { left: '22%', top: '40%', s: 4, d: 14, del: 1.5 },
                { left: '55%', top: '80%', s: 5, d: 13, del: 0.8 },
                { left: '72%', top: '30%', s: 3, d: 15, del: 2.1 },
                { left: '88%', top: '62%', s: 5, d: 12.5, del: 0.4 },
              ].map((p, i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full bg-gold-400/60 blur-[1px]"
                  style={{ left: p.left, top: p.top, width: p.s, height: p.s }}
                  animate={{ y: [0, -60, 0], opacity: [0, 0.9, 0] }}
                  transition={{
                    duration: p.d,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: p.del,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:py-14">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/75"
          >
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span className="text-white/50">/</span>
            <span className="font-medium text-white">Contact</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mb-3 flex items-center justify-center gap-3"
          >
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
              className="h-px w-10 origin-right bg-gradient-to-r from-transparent to-white/70"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85">
              We&apos;re Here to Help
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
              className="h-px w-10 origin-left bg-gradient-to-l from-transparent to-white/70"
            />
          </motion.div>

          <h1 className="font-serif text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
            <RevealWords text="Get in" delay={0.35} stagger={0.08} />{' '}
            <span className="text-white">
              <RevealWords text="Touch" delay={0.55} stagger={0.08} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
            className="mx-auto mt-3 max-w-xl text-sm text-white/85"
          >
            Questions about a machine, a spec, delivery or a repair? We&apos;re happy to help.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
            className="mx-auto mt-5 h-px w-20 origin-center bg-gradient-to-r from-transparent via-white/80 to-transparent"
          />
        </div>
      </section>

      {/* ══════════════ CONTACT CONTENT ══════════════ */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* ── LEFT: Clickable contact info + map ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            whileHover={{ y: -4, transition: SPRING_SOFT }}
            className="relative flex flex-col overflow-hidden rounded-xl border border-gold-500/15 bg-white shadow-sm"
          >
            {/* Border trace on entry */}
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px origin-left bg-gradient-to-r from-transparent via-gold-400/70 to-transparent"
            />
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px origin-right bg-gradient-to-l from-transparent via-gold-400/70 to-transparent"
            />

            {/* Decorative corners */}
            <CornerAccent position="tl" />
            <CornerAccent position="br" />

            <div className="relative overflow-hidden bg-charcoal px-5 py-4">
              <motion.div
                aria-hidden
                initial={{ opacity: 0, scale: 1.15 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 1, ease: EASE }}
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15),transparent_70%)]"
              />
              {/* Sweep */}
              <motion.span
                aria-hidden
                initial={{ x: '-120%', opacity: 0 }}
                whileInView={{ x: '120%', opacity: [0, 0.5, 0] }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 1.2, delay: 0.6, ease: EASE }}
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-gold-400/25 to-transparent"
              />
              <div className="relative">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400">
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
                    className="h-px w-5 origin-left bg-gold-400"
                  />
                  Contact Information
                </span>
                <h2 className="mt-1 font-serif text-lg text-cream">
                  Visit, Call, or Email Us
                </h2>
              </div>
            </div>

            <div className="divide-y divide-gold-500/10">
              <ContactRow
                index={0}
                icon={<PinIcon />}
                label="Address"
                value={address}
                href={STORE_MAP_PLACE_URL}
                external
              />
              <ContactRow
                index={1}
                icon={<PhoneIcon />}
                label="Phone"
                value={phone || 'Available on request'}
                href={phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined}
              />
              <ContactRow
                index={2}
                icon={<MailIcon />}
                label="Email"
                value={email || 'Available on request'}
                href={email ? `mailto:${email}` : undefined}
              />
            </div>

            <div className="relative flex-1 overflow-hidden border-t border-gold-500/15">
              {/* Map skeleton */}
              <MapSkeleton />
              <iframe
                title="Store location"
                src={STORE_MAP_EMBED_URL}
                width="100%"
                height="240"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="relative block h-full min-h-[240px] w-full"
                onLoad={(e) => {
                  const skel = e.currentTarget.previousElementSibling;
                  if (skel) skel.style.display = 'none';
                }}
              />
            </div>
          </motion.div>

          {/* ── RIGHT: Form ── */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
            whileHover={{ y: -4, transition: SPRING_SOFT }}
            onSubmit={handleSubmit}
            className="relative flex flex-col overflow-hidden rounded-xl border border-gold-500/15 bg-white shadow-sm"
          >
            {/* Border trace on entry */}
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px origin-left bg-gradient-to-r from-transparent via-gold-400/70 to-transparent"
            />
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px origin-right bg-gradient-to-l from-transparent via-gold-400/70 to-transparent"
            />

            <CornerAccent position="tr" />
            <CornerAccent position="bl" />

            <div className="relative overflow-hidden bg-charcoal px-5 py-4">
              <motion.div
                aria-hidden
                initial={{ opacity: 0, scale: 1.15 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 1, ease: EASE }}
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15),transparent_70%)]"
              />
              <motion.span
                aria-hidden
                initial={{ x: '-120%', opacity: 0 }}
                whileInView={{ x: '120%', opacity: [0, 0.5, 0] }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 1.2, delay: 0.7, ease: EASE }}
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-gold-400/25 to-transparent"
              />
              <div className="relative">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400">
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
                    className="h-px w-5 origin-left bg-gold-400"
                  />
                  Send a Message
                </span>
                <h2 className="mt-1 font-serif text-lg text-cream">
                  We&apos;ll Reply Within 24 Hours
                </h2>
              </div>
            </div>

            <div className="relative flex flex-1 flex-col gap-4 p-5 sm:p-6">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center"
                  >
                    <motion.span
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ ...SPRING, delay: 0.15 }}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-600"
                    >
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <motion.path
                          d="M20 6L9 17l-5-5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
                        />
                      </svg>
                    </motion.span>
                    <h3 className="font-serif text-xl text-charcoal">Message Sent</h3>
                    <p className="max-w-xs text-sm text-charcoal-light">
                      Thanks for reaching out. We&apos;ll be in touch within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-1 flex-col gap-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0 }}
                      transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
                    >
                      <Input
                        label="Your Name"
                        required
                        maxLength={25}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0 }}
                      transition={{ duration: 0.5, delay: 0.42, ease: EASE }}
                    >
                      <Input
                        label="Email Address"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0 }}
                      transition={{ duration: 0.5, delay: 0.49, ease: EASE }}
                    >
                      <Textarea
                        label="Your Message"
                        rows={5}
                        required
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </motion.div>

                    <div className="mt-auto pt-1">
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0 }}
                        transition={{ duration: 0.5, delay: 0.56, ease: EASE }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative overflow-hidden rounded-md"
                      >
                        <Button type="submit" variant="gold" loading={sending} className="w-full">
                          Send Message
                        </Button>
                        {/* Hover shimmer */}
                        <motion.span
                          aria-hidden
                          initial={{ x: '-120%' }}
                          whileHover={{ x: '120%' }}
                          transition={{ duration: 0.9, ease: EASE }}
                          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        />
                      </motion.div>
                    </div>

                    {/* Trust row */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, amount: 0 }}
                      transition={{ duration: 0.5, delay: 0.7, ease: EASE }}
                      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 text-[10px] uppercase tracking-wider text-charcoal-light/70"
                    >
                      <span>12 Month Warranty</span>
                      <span className="text-gold-500">·</span>
                      <span>Free UK Delivery over £250</span>
                      <span className="text-gold-500">·</span>
                      <span>Tested in Burnley</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        </div>
      </div>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="relative overflow-hidden bg-cream">
        {/* Ambient breathing glow */}
        <motion.div
          aria-hidden
          animate={reduce ? {} : { opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(240,108,12,0.14),transparent_60%)]"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
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
              Explore Our Collection
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
            Ready to Find <span className="text-gold-600">Your Machine?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
            className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal-light sm:text-base"
          >
            Browse refurbished desktops, laptops, gaming PCs and monitors — all tested, all warranted,
            with free UK delivery over £250.
          </motion.p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/onlineshop">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative overflow-hidden rounded-md"
              >
                <Button variant="gold" size="lg">Shop Now</Button>
                <motion.span
                  aria-hidden
                  initial={{ x: '-120%' }}
                  whileHover={{ x: '120%' }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

/* ═══════════════ Contact Row (clickable) ═══════════════ */
function ContactRow({ icon, label, value, href, external, index = 0 }) {
  const content = (
    <>
      <motion.span
        whileHover={{ scale: 1.1, rotate: 6 }}
        transition={SPRING}
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-600 transition-colors duration-300 group-hover:bg-gold-500/20"
      >
        {icon}
      </motion.span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">{label}</p>
        <p className="mt-0.5 truncate text-sm text-charcoal transition-colors group-hover:text-gold-600">
          {value || '—'}
        </p>
      </div>
      {href && (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          className="mt-2 shrink-0 text-gold-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <ArrowIcon />
        </motion.span>
      )}
    </>
  );

  const baseClass = 'group relative flex items-start gap-3 px-5 py-4 transition-colors duration-200';

  const wrapped = (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.1, ease: EASE }}
    >
      {!href ? (
        <div className={baseClass}>{content}</div>
      ) : external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClass} hover:bg-gold-50/50`}
        >
          {content}
        </a>
      ) : (
        <a href={href} className={`${baseClass} hover:bg-gold-50/50`}>
          {content}
        </a>
      )}
    </motion.div>
  );

  return wrapped;
}

/* ═══════════════ Corner Accent ═══════════════ */
function CornerAccent({ position = 'tl' }) {
  const isTop = position.startsWith('t');
  const isLeft = position.endsWith('l');
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
      className={`pointer-events-none absolute z-10 h-3 w-3 ${
        isTop ? 'top-2' : 'bottom-2'
      } ${isLeft ? 'left-2' : 'right-2'}`}
      style={{
        borderTop: isTop ? '2px solid rgba(240,108,12,0.5)' : 'none',
        borderBottom: !isTop ? '2px solid rgba(240,108,12,0.5)' : 'none',
        borderLeft: isLeft ? '2px solid rgba(240,108,12,0.5)' : 'none',
        borderRight: !isLeft ? '2px solid rgba(240,108,12,0.5)' : 'none',
      }}
    />
  );
}

/* ═══════════════ Map Skeleton ═══════════════ */
function MapSkeleton() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-stone-100">
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-2 text-charcoal-light/60"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        <span className="text-[10px] uppercase tracking-widest">Loading map…</span>
      </motion.div>
    </div>
  );
}

/* ═══════════════ Icons ═══════════════ */
function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7M17 7H8M17 7v9" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6a2 2 0 0 1 1.8 2Z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}