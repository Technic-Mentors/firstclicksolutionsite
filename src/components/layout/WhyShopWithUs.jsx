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
    <section className="relative overflow-hidden border-y border-forest-700/10 bg-cream-dark">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12),transparent_65%)]" />
      {/* faint dot grid, fades out toward the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: 'radial-gradient(rgba(20,83,45,0.07) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-3xl border border-forest-700/10 bg-white px-5 py-8 shadow-xl shadow-forest-700/8 sm:px-8 sm:py-10 lg:px-10">
        {/* heading + live "status" pill */}
        <div className="mb-9 flex flex-col items-center gap-3 text-center sm:mb-11">
          <h2 className="flex items-center justify-center gap-3 font-serif text-3xl font-semibold tracking-tight text-forest-700 sm:text-4xl lg:text-5xl">
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
              className="h-0.5 w-8 origin-right bg-gradient-to-r from-transparent to-gold-500 sm:w-12"
            />
            Why Shop With Us
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
              className="h-0.5 w-8 origin-left bg-gradient-to-l from-transparent to-gold-500 sm:w-12"
            />
          </h2>
          <p className="max-w-xl text-base text-charcoal-light sm:text-lg">A little more confidence with every order.</p>
          <span className="inline-flex items-center gap-2 rounded-full border border-forest-700/10 bg-white/85 px-3 py-1 font-mono text-[10px] text-forest-700 shadow-sm">
            <span className="relative flex h-2 w-2">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-leaf-500"
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf-600" />
            </span>
            all systems go
          </span>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                  className="group relative flex min-h-48 flex-col items-center gap-3 overflow-hidden rounded-2xl border border-forest-700/10 bg-cream px-4 pb-6 pt-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:bg-white hover:shadow-lg sm:min-h-56 sm:px-5"
                >
                  {/* hover sheen */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold-500/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

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
                  <span className="relative mt-1 flex h-14 w-14 items-center justify-center">
                    <motion.span
                      aria-hidden
                      className={`absolute -inset-1.5 rounded-full border border-dashed ${leaf ? 'border-leaf-500/35' : 'border-gold-500/40'}`}
                      animate={{ rotate: leaf ? -360 : 360 }}
                      transition={{ duration: 14, ease: 'linear', repeat: Infinity }}
                    />
                    <motion.span
                      whileHover={{ rotate: -10, scale: 1.12 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm ${leaf ? 'border-forest-700 bg-forest-700 text-white' : 'border-gold-500 bg-gold-500 text-white'}`}
                    >
                      <Icon animated className="h-7 w-7" />
                    </motion.span>
                  </span>

                  <div>
                    <p className="text-base font-semibold text-forest-700 sm:text-lg">{label}</p>
                    <p className="mt-1 text-sm text-charcoal-light">{description}</p>
                  </div>

                  {/* underline that grows on hover */}
                  <span className={`h-0.5 w-6 rounded-full transition-all duration-500 group-hover:w-16 ${leaf ? 'bg-forest-600' : 'bg-gold-500'}`} />
                </motion.div>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
