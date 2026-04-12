'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface CitationChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  docId: string;
  page: number;
  label: string;
}

export const CitationChip = React.forwardRef<HTMLButtonElement, CitationChipProps>(
  ({ docId, page, label, className, onClick, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-doc-id={docId}
      data-page={page}
      aria-label={`Citation ${label}, page ${page}`}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 align-baseline',
        'rounded-[4px] border border-[rgba(4,120,87,0.15)]',
        'bg-[color:var(--badge-emerald-bg)] px-1.5 py-0.5',
        'text-xs font-semibold leading-[1.33] tracking-[0.125px]',
        'text-[color:var(--badge-emerald-text-dark)]',
        'transition-colors hover:bg-[color:var(--esap-emerald-100)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
        className,
      )}
      {...props}
    >
      <span>{label}</span>
      <span aria-hidden>·</span>
      <span>p.{page}</span>
    </button>
  ),
);
CitationChip.displayName = 'CitationChip';
