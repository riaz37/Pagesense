'use client';

import { useEffect, useState, type RefObject } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface ScrollButtonProps {
  containerRef: RefObject<HTMLElement | null>;
  threshold?: number;
}

export function ScrollButton({ containerRef, threshold = 120 }: ScrollButtonProps) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const fits = el.scrollHeight <= el.clientHeight;
      setVisible(!fits && distanceFromBottom > threshold);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [containerRef, threshold]);

  const handleClick = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label={t('scrollToLatest')}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'pointer-events-auto absolute bottom-[88px] z-10 inline-flex items-center gap-1.5',
            'rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]',
            'px-3 py-1.5 text-[12px] font-medium text-[color:var(--text-secondary)]',
            'shadow-[var(--shadow-floating)] backdrop-blur',
            'hover:text-[color:var(--esap-emerald-700)] hover:border-[color:var(--esap-emerald-700)]/40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
            'transition-colors',
            locale === 'ar' ? 'left-4' : 'right-4',
          )}
        >
          <span>{t('scrollToLatest')}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
