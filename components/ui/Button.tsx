'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/cn';

const button = tv({
  base: [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'text-[15px] font-semibold leading-[1.33]',
    'rounded-[4px] px-4 py-2',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-page)]',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]',
  ],
  variants: {
    variant: {
      primary: [
        'bg-[color:var(--esap-emerald-700)] text-white',
        'hover:bg-[color:var(--esap-emerald-800)]',
        'border border-transparent',
      ],
      secondary: [
        'bg-black/5 text-[color:var(--text-primary)]',
        'hover:bg-black/10',
        'border border-transparent',
        'dark:bg-white/5 dark:hover:bg-white/10',
      ],
      ghost: [
        'bg-transparent text-[color:var(--text-primary)]',
        'hover:underline underline-offset-4',
      ],
    },
    size: {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-[15px] px-4 py-2',
      lg: 'text-base px-5 py-2.5',
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
