'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

export function EmptyState() {
  const t = useTranslations('chat');
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? false : { opacity: 0, scale: 0.96, y: 6 };
  const animate = { opacity: 1, scale: 1, y: 0 };
  const transition = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div
      className="flex w-full flex-col items-center px-6"
      data-testid="chat-empty"
    >
      <motion.img
        src="/esap_logo_white.png"
        alt={t('empty.brandAlt')}
        draggable={false}
        initial={initial}
        animate={animate}
        transition={transition}
        className="h-20 w-auto select-none object-contain opacity-90 hidden dark:block"
      />
      <motion.img
        src="/esap_logo_black.png"
        alt=""
        aria-hidden
        draggable={false}
        initial={initial}
        animate={animate}
        transition={transition}
        className="h-20 w-auto select-none object-contain opacity-90 block dark:hidden"
      />
    </div>
  );
}
