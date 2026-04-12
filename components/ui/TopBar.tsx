'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
}

export function TopBar({ breadcrumb, actions, className, ...props }: TopBarProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between gap-4',
        'border-b border-black/10 dark:border-white/10',
        'bg-[color:var(--bg-surface)] px-4',
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1 truncate text-[15px] text-[color:var(--text-secondary)]">
        {breadcrumb}
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}
