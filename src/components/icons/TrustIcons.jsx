import { motion } from 'framer-motion';

export function TruckIcon({ animated = false, className = 'h-4 w-4' }) {
  return (
    <motion.svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      animate={animated ? { x: [0, 1.5, 0] } : undefined} transition={animated ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}>
      <path d="M2 6h11v11H2zM13 10h4l4 4v3h-8z" />
      <motion.circle cx="6.5" cy="19" r="1.8" animate={animated ? { rotate: 360 } : undefined} style={{ transformOrigin: '6.5px 19px' }} transition={animated ? { duration: 2, repeat: Infinity, ease: 'linear' } : undefined} />
      <motion.circle cx="16.5" cy="19" r="1.8" animate={animated ? { rotate: 360 } : undefined} style={{ transformOrigin: '16.5px 19px' }} transition={animated ? { duration: 2, repeat: Infinity, ease: 'linear' } : undefined} />
    </motion.svg>
  );
}

export function ReturnIcon({ animated = false, className = 'h-4 w-4' }) {
  return (
    <motion.svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      animate={animated ? { rotate: [0, -8, 0] } : undefined} transition={animated ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } : undefined}>
      <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v4h4" />
    </motion.svg>
  );
}

export function BadgeIcon({ animated = false, className = 'h-4 w-4' }) {
  return (
    <motion.svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      animate={animated ? { scale: [1, 1.08, 1] } : undefined} transition={animated ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}>
      <motion.path d="m9 12 2 2 4-4" animate={animated ? { pathLength: [0.6, 1, 0.6] } : undefined} transition={animated ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined} />
      <circle cx="12" cy="12" r="9" />
    </motion.svg>
  );
}

export function LockIcon({ animated = false, className = 'h-4 w-4' }) {
  return (
    <motion.svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      animate={animated ? { y: [0, -1, 0] } : undefined} transition={animated ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : undefined}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <motion.path d="M8 10V7a4 4 0 0 1 8 0v3" animate={animated ? { y: [0, -1, 0] } : undefined} transition={animated ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : undefined} />
    </motion.svg>
  );
}

export function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function ModestyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2c-1.5 2-1.5 4 0 6-1.5 2-1.5 4 0 6-1.5 2-1.5 4 0 6" />
      <path d="M6 5c1 3 1 5-1 9M18 5c-1 3-1 5 1 9" />
    </svg>
  );
}
