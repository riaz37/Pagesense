'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { useUploadJobs } from '@/lib/uploadJobsContext';
import UploadPanel from '@/components/UploadPanel';

interface UploadIndicatorProps {
  collapsed?: boolean;
}

export default function UploadIndicator({ collapsed = false }: UploadIndicatorProps) {
  const t = useTranslations('upload');
  const locale = useLocale();
  const { activeJobs, jobs } = useUploadJobs();
  const [open, setOpen] = useState(false);

  if (jobs.length === 0) return null;

  const activeCount = activeJobs.length;
  const isRtl = locale === 'ar';
  const popoverSide = isRtl ? 'left' : 'right';

  const label =
    activeCount > 0
      ? t('indicator.processing', { count: activeCount })
      : t('indicator.idle');
  const ariaLabel = `${label} — ${t('indicator.open')}`;

  return (
    <div className={collapsed ? 'px-2 pb-2' : 'px-3 pb-2'}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {collapsed ? (
            <button
              type="button"
              title={ariaLabel}
              aria-label={ariaLabel}
              className="relative flex h-9 w-full items-center justify-center rounded-md text-[color:var(--sidebar-text-dim)] transition-colors hover:bg-[color:var(--sidebar-hover)] hover:text-[color:var(--sidebar-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
            >
              <TriggerIcon active={activeCount > 0} count={activeCount} />
            </button>
          ) : (
            <button
              type="button"
              aria-label={ariaLabel}
              className="flex w-full items-center gap-2.5 rounded-lg border border-[color:var(--sidebar-divider)] bg-[color:var(--sidebar-hover)] px-3 py-2 text-[13px] font-medium text-[color:var(--sidebar-text)] transition-colors hover:bg-[color:var(--sidebar-active-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
            >
              <TriggerIcon active={activeCount > 0} count={activeCount} inline />
              <span className="flex-1 truncate text-start" dir="auto">
                {label}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
                className="shrink-0 text-[color:var(--sidebar-text-muted)]"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent
          side={popoverSide}
          align="end"
          sideOffset={12}
          collisionPadding={12}
          className="w-[400px] max-w-[calc(100vw-1.5rem)] p-4"
        >
          <UploadPanel onClose={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface TriggerIconProps {
  active: boolean;
  count: number;
  inline?: boolean;
}

function TriggerIcon({ active, count, inline = false }: TriggerIconProps) {
  if (active) {
    return (
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[color:var(--esap-emerald-500)] border-t-transparent" />
        {!inline && (
          <span className="absolute -end-1 -top-1 inline-flex h-3 min-w-[12px] items-center justify-center rounded-full bg-[color:var(--esap-emerald-700)] px-1 text-[9px] font-semibold leading-none text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[color:var(--esap-emerald-500)]/15 text-[color:var(--esap-emerald-700)]"
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}
