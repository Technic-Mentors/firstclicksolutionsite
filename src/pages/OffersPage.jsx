import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAsync } from '../hooks/useAsync';
import { getProducts } from '../api/catalog.api';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
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

export default function OffersPage() {
  const { data, loading } = useAsync(() => getProducts({ pageSize: 40 }), []);
  const offers = data?.data?.filter(
    (p) => p.compare_at_price && Number(p.compare_at_price) > Number(p.min_price)
  );

  const maxDiscount = offers?.length
    ? Math.max(
        ...offers.map((p) =>
          Math.round(((Number(p.compare_at_price) - Number(p.min_price)) / Number(p.compare_at_price)) * 100)
        )
      )
    : 0;

  return (
    <div>
      {/* ══════════════ HERO — Sunlit Gradient ══════════════ */}
      <section className="relative isolate overflow-hidden bg-gold-500 text-white">
        <PageHeroBg />

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <nav className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/75">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span className="text-white/50">/</span>
            <span className="font-medium text-white">Offers</span>
          </nav>

          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/70" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85">
              Limited Time Deals
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/70" />
          </div>

          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            Special <span className="text-white">Offers</span>
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm text-white/85 sm:text-base">
            Limited-time deals on refurbished desktops, laptops, gaming PCs and monitors — the same
            testing and the same 12 month warranty, at a lower price.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
              {loading ? 'Loading deals...' : `${offers?.length || 0} Deal${offers?.length === 1 ? '' : 's'} Available`}
            </span>
            {maxDiscount > 0 && !loading && (
              <>
                <span className="text-gold-400/70">·</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">
                  Up to {maxDiscount}% Off
                </span>
              </>
            )}
          </motion.div>

          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        </div>
      </section>

      {/* ══════════════ OFFERS GRID ══════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : !offers?.length ? (
          <EmptyState
            title="No offers right now"
            description="Check back soon for limited-time deals on refurbished computers, laptops and monitors."
          />
        ) : (
          <>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mb-6 flex flex-col items-center text-center"
            >
              <span className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                <span className="h-px w-5 bg-gold-400" />
                Save on Tested Hardware
                <span className="h-px w-5 bg-gold-400" />
              </span>
              <h2 className="font-serif text-xl text-charcoal sm:text-2xl">On-Sale Products</h2>
              <p className="mt-1.5 max-w-md text-sm text-charcoal-light">
                Handpicked machines with reduced pricing — while stocks last.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
            >
              {offers.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="relative"
                >
                  {product.compare_at_price && product.min_price && (
                    <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal shadow-md">
                      -
                      {Math.round(
                        ((Number(product.compare_at_price) - Number(product.min_price)) /
                          Number(product.compare_at_price)) *
                          100
                      )}
                      %
                    </div>
                  )}
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      {offers?.length > 0 && !loading && (
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
                Explore the Full Collection
              </span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-500/60" />
            </div>

            <h2 className="font-serif text-2xl leading-tight text-charcoal sm:text-3xl lg:text-4xl">
              Looking for <span className="text-gold-600">Something Else?</span>
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal-light sm:text-base">
              Browse the full range — desktops, laptops, gaming PCs, mini and SFF computers, monitors and
              complete dual screen setups, with free UK delivery over £250.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/onlineshop">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button variant="gold" size="lg">Shop Now</Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}