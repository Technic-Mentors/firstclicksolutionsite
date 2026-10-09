import { motion } from 'framer-motion';
import { assetUrl } from '../../utils/media';

/** Consistent orange page header banner, with an optional admin-uploaded background image. */
export default function PageHeroBanner({ title, subtitle, imageUrl }) {
  return (
    <section className="relative overflow-hidden bg-gold-500 py-16 text-center text-white">
      {imageUrl && (
        <div className="absolute inset-0">
          <img src={assetUrl(imageUrl)} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gold-700/75" />
        </div>
      )}
      <div className="relative px-4 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-serif text-4xl capitalize text-white"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-3 max-w-lg text-white/85"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
