import { motion } from 'framer-motion';
import { TruckIcon, ReturnIcon, BadgeIcon, LockIcon } from '../icons/TrustIcons';

const EASE = [0.22, 1, 0.36, 1];

const TRUST_POINTS = [
  { icon: TruckIcon, label: 'Free UK Delivery', description: 'On orders over £250', tag: 'ship', accent: 'gold' },
  { icon: ReturnIcon, label: '14 Day Returns', description: 'Hassle-free returns', tag: 'return', accent: 'leaf' },
  { icon: BadgeIcon, label: '12 Month Warranty', description: 'Every machine tested', tag: 'cover', accent: 'gold' },
  { icon: LockIcon, label: 'Secure Checkout', description: 'Your details stay safe', tag: 'secure', accent: 'leaf' },
];

const CARD = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE, delay: i * 0.1 } }),
};

export default function WhyShopWithUs() {
  return (
    <section className="relative overflow-hidden border-t border-stone-200 bg-cream">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_65%)]" />
      {/* faint dot grid, fades out toward the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6">
        {/* heading + live "status" pill */}
        <div className="mb-7 flex flex-col items-center gap-2">
          <h2 className="flex items-center justify-center gap-3 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
              className="h-px w-10 origin-right bg-gradient-to-r from-transparent to-gold-500/70"
            />
            Why Shop With Us
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
              className="h-px w-10 origin-left bg-gradient-to-l from-transparent to-gold-500/70"
            />
          </h2>
          <span className="inline-flex items-center gap-2 rounded-full border border-leaf-500/25 bg-white/80 px-3 py-1 font-mono text-[10px] text-leaf-700 shadow-sm backdrop-blur">
            <span className="relative flex h-2 w-2">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-leaf-500"
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf-500" />
            </span>
            all systems go
          </span>
        </div>

        <div className="relative">
          {/* connector line with a travelling pulse (desktop) */}
          <div aria-hidden className="pointer-events-none absolute left-[12%] right-[12%] top-[1.65rem] hidden h-px bg-gradient-to-r from-gold-500/10 via-gold-500/40 to-leaf-500/10 sm:block">
            <motion.span
              className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-gold-500 shadow-[0_0_10px_2px_rgba(212,175,55,0.7)]"
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TRUST_POINTS.map(({ icon: Icon, label, description, tag, accent }, i) => {
              const leaf = accent === 'leaf';
              return (
                <motion.div
                  key={label}
                  custom={i}
                  variants={CARD}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.4 }}
                  whileHover={{ y: -6 }}
                  className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-charcoal/5 bg-white/70 px-3 pb-4 pt-3 text-center shadow-sm backdrop-blur transition-shadow hover:shadow-xl"
                >
                  {/* hover sheen */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold-500/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

                  {/* status LED + tag, laptop-ish */}
                  <span className="absolute right-2.5 top-2 flex items-center gap-1 font-mono text-[9px] text-charcoal-light/70">
                    {tag}
                    <motion.i
                      className={`h-1.5 w-1.5 rounded-full ${leaf ? 'bg-leaf-500' : 'bg-gold-500'}`}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                    />
                  </span>

                  {/* icon with spinning dashed ring */}
                  <span className="relative mt-1 flex h-11 w-11 items-center justify-center">
                    <motion.span
                      aria-hidden
                      className={`absolute -inset-1.5 rounded-full border border-dashed ${
                        leaf ? 'border-leaf-500/50' : 'border-gold-500/50'
                      }`}
                      animate={{ rotate: leaf ? -360 : 360 }}
                      transition={{ duration: 14, ease: 'linear', repeat: Infinity }}
                    />
                    <motion.span
                      whileHover={{ rotate: -10, scale: 1.12 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      className={`relative flex h-11 w-11 items-center justify-center rounded-full border ${
                        leaf
                          ? 'border-leaf-500/30 bg-leaf-500/10 text-leaf-700'
                          : 'border-gold-500/30 bg-gold-500/10 text-gold-600'
                      }`}
                    >
                      <Icon />
                    </motion.span>
                  </span>

                  <div>
                    <p className="text-sm font-medium text-charcoal">{label}</p>
                    <p className="text-xs text-charcoal-light">{description}</p>
                  </div>

                  {/* underline that grows on hover */}
                  <span
                    className={`h-0.5 w-6 rounded-full transition-all duration-500 group-hover:w-16 ${
                      leaf ? 'bg-leaf-500' : 'bg-gold-500'
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}