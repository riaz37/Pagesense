'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode;
  items: SidebarItem[];
  footer?: React.ReactNode;
}

export function Sidebar({ brand, items, footer, className, ...props }: SidebarProps) {
  return (
    <nav
      aria-label="Workspace"
      className={cn(
        'flex h-full w-[260px] shrink-0 flex-col',
        'border-e border-[color:var(--sidebar-border)] bg-[color:var(--sidebar-bg)]',
        'text-[color:var(--sidebar-text)]',
        className,
      )}
      {...props}
    >
      {brand && <div className="px-4 py-4">{brand}</div>}
      <ul className="flex-1 space-y-0.5 px-2">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 rounded-[4px] px-3 py-2',
                'text-[15px] font-medium leading-[1.33]',
                'transition-colors hover:bg-[color:var(--sidebar-hover)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
                item.active &&
                  'bg-[color:var(--sidebar-active-bg)] text-[color:var(--esap-emerald-700)]',
              )}
            >
              {item.icon && <span aria-hidden className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
      {footer && (
        <div className="border-t border-[color:var(--sidebar-divider)] px-4 py-3">{footer}</div>
      )}
    </nav>
  );
}
