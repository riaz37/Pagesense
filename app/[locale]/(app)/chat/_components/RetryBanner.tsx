'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface RetryBannerProps {
  onRetry: () => void;
  className?: string;
}

export function RetryBanner({ onRetry, className }: RetryBannerProps) {
  const t = useTranslations('chat.retry');
  return (
    <div
      role="alert"
      className={cn(
        'mt-3 inline-flex items-center gap-3 rounded-[8px] border px-3 py-2',
        'border-amber-400/30 bg-amber-400/10 text-[13px] text-[color:var(--text-secondary)]',
        className,
      )}
      dir="auto"
    >
      <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-amber-500" />
      <span>{t('banner')}</span>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          'rounded-[4px] px-2 py-0.5 text-[13px] font-semibold',
          'text-[color:var(--esap-emerald-700)] hover:bg-[color:var(--esap-emerald-50)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
        )}
      >
        {t('cta')}
      </button>
    </div>
  );
}
