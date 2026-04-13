'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/cn';

const button = tv({
  base: [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-semibold leading-[1.33]',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-page)]',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]',
  ],
  variants: {
    variant: {
      primary: [
        'rounded-full border border-transparent',
        'bg-[color:var(--esap-emerald-700)] text-white',
        'shadow-[0_1px_0_rgba(0,0,0,0.04),0_4px_14px_-8px_rgba(4,120,87,0.55)]',
        'hover:bg-[color:var(--esap-emerald-800)]',
      ],
      secondary: [
        'rounded-full border border-[color:var(--border-default)]',
        'bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]',
        'hover:bg-[color:var(--bg-surface-subtle)]',
      ],
      ghost: [
        'rounded-full border border-[color:var(--border-default)]',
        'bg-transparent text-[color:var(--text-primary)]',
        'hover:bg-[color:var(--bg-surface-subtle)]',
      ],
    },
    size: {
      sm: 'text-[13px] px-3 py-1.5',
      md: 'text-[14px] px-4 py-2.5',
      lg: 'text-[15px] px-5 py-3',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(button({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = 'Button';
