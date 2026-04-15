import * as React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/cn';

const pill = tv({
  base: [
    'inline-flex items-center gap-2 rounded-full ring-1 ring-inset',
    'font-semibold tracking-[0.125px] leading-none',
  ],
  variants: {
    tone: {
      emerald:
        'bg-[color:var(--badge-emerald-bg)] text-[color:var(--badge-emerald-text)] ring-[color:var(--esap-emerald-700)]/15 dark:text-[color:var(--badge-emerald-text-dark)] dark:ring-[color:var(--esap-emerald-500)]/25',
      amber:
        'bg-[color:var(--warning-bg)] text-[color:var(--warning-text)] ring-[color:var(--warning-text)]/20',
      red: 'bg-red-50 text-red-800 ring-red-500/20 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/30',
      neutral:
        'bg-black/5 text-[color:var(--text-secondary)] ring-black/5 dark:bg-white/10 dark:ring-white/10',
    },
    size: {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3.5 py-1.5 text-[13px] tracking-[0.2px]',
      lg: 'px-4 py-2 text-sm uppercase tracking-[0.14em]',
    },
  },
  defaultVariants: { tone: 'emerald', size: 'sm' },
});

export interface PillBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof pill> { }

export const PillBadge = React.forwardRef<HTMLSpanElement, PillBadgeProps>(
  ({ className, tone, children, ...props }, ref) => (
    <span ref={ref} className={cn(pill({ tone }), className)} {...props}>
      {children}
    </span>
  ),
);
PillBadge.displayName = 'PillBadge';
