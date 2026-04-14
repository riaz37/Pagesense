'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface RetryBannerProps {
  onRetry: () => void;
  className?: string;
}

export function RetryBanner({ onRetry, className }: RetryBannerProps) {
  const t = useTranslations('chat.retry');
  const reduceMotion = useReducedMotion();
  return (
    <div
      role="alert"
      className={cn(
        'mt-3 inline-flex items-center gap-3 rounded-[8px] border px-3 py-2',
        'border-[color:var(--warning-border)] bg-[color:var(--warning-bg)]',
        'text-[13px] text-[color:var(--text-secondary)]',
        className,
      )}
      dir="auto"
    >
      <motion.span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full bg-[color:var(--warning-dot)]"
        initial={false}
        animate={reduceMotion ? { opacity: 1 } : { opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.6, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
      />
      <span>{t('banner')}</span>
      <motion.button
        type="button"
        onClick={onRetry}
        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        className={cn(
          'rounded-[4px] px-2 py-0.5 text-[13px] font-semibold',
          'text-[color:var(--esap-emerald-700)]',
          'hover:bg-[color:var(--badge-emerald-bg)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
          'transition-colors',
        )}
      >
        {t('cta')}
      </motion.button>
    </div>
  );
}
