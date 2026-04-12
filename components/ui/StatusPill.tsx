import * as React from 'react';
import { cn } from '@/lib/cn';
import { PillBadge } from './PillBadge';

export type DocStatus = 'indexed' | 'processing' | 'failed' | 'draft';

const tone: Record<DocStatus, React.ComponentProps<typeof PillBadge>['tone']> = {
  indexed: 'emerald',
  processing: 'amber',
  failed: 'red',
  draft: 'neutral',
};

const labelEn: Record<DocStatus, string> = {
  indexed: 'Indexed',
  processing: 'Processing',
  failed: 'Failed',
  draft: 'Draft',
};

const labelAr: Record<DocStatus, string> = {
  indexed: 'مفهرس',
  processing: 'قيد المعالجة',
  failed: 'فشل',
  draft: 'مسودة',
};

export interface StatusPillProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  status: DocStatus;
  locale?: 'en' | 'ar';
  label?: string;
}

export function StatusPill({ status, locale = 'en', label, className, ...props }: StatusPillProps) {
  const text = label ?? (locale === 'ar' ? labelAr[status] : labelEn[status]);
  const pulsing = status === 'processing';
  return (
    <PillBadge
      tone={tone[status]}
      role="status"
      aria-label={text}
      data-status={status}
      className={cn(pulsing && 'animate-[pulse_1.5s_ease-in-out_infinite]', className)}
      {...props}
    >
      {pulsing && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70"
          aria-hidden
        />
      )}
      {text}
    </PillBadge>
  );
}
