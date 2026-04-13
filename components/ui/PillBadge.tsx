import * as React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/cn';

const pill = tv({
  base: [
    'inline-flex items-center gap-1.5 rounded-full',
    'px-2 py-0.5 text-xs font-semibold tracking-[0.125px] leading-[1.33]',
  ],
  variants: {
    tone: {
      emerald: 'bg-[color:var(--badge-emerald-bg)] text-[color:var(--badge-emerald-text-dark)]',
      amber: 'bg-[color:var(--warning-bg)] text-[color:var(--warning-text)]',
      red: 'bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300',
      neutral: 'bg-black/5 text-[color:var(--text-secondary)] dark:bg-white/10',
    },
  },
  defaultVariants: { tone: 'emerald' },
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
