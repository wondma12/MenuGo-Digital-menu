// Shared Framer Motion variants for consistent animations across public pages
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.10,
      delayChildren: 0.06,
    },
  },
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export const fadeInDown = {
  hidden: { opacity: 0, y: -18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export const heroImage = {
  hidden: { opacity: 0, scale: 0.98, rotate: -1 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

export const popIn = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

// Reusable hover/tap interaction configuration (applied via spread when needed)
export const hoverLift = {
  whileHover: { scale: 1.035, y: -6, transition: { duration: 0.22 } },
  whileTap: { scale: 0.995 },
}

export const subtleFloat = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, y: { type: 'spring', stiffness: 120, damping: 14 } } },
}

export default {
  staggerContainer,
  fadeInUp,
  fadeInDown,
  heroImage,
  popIn,
  hoverLift,
  subtleFloat,
}
