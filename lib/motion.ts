import type { Transition } from 'framer-motion';

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 26,
  mass: 0.9,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
};

export const easeOut: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

export const easeOutQuick: Transition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
};

export const staggerChildren = (delay = 0.06): Transition => ({
  staggerChildren: delay,
});
