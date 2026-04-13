'use client';

import * as React from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { cn } from '@/lib/cn';

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavProps {
  items: NavItem[];
  className?: string;
  'aria-label'?: string;
}

export function Nav({ items, className, 'aria-label': ariaLabel = 'Primary' }: NavProps) {
  return (
    <NavigationMenu.Root aria-label={ariaLabel} className={cn('w-full', className)}>
      <NavigationMenu.List className="flex items-center gap-1">
        {items.map((item) => (
          <NavigationMenu.Item key={item.href}>
            <NavigationMenu.Link asChild active={item.active}>
              <a
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center rounded-[4px] px-3 py-1.5',
                  'text-[15px] font-semibold leading-[1.33]',
                  'text-[color:var(--text-secondary)] transition-colors',
                  'hover:bg-[color:var(--bg-surface-hover)] hover:text-[color:var(--text-primary)]',
                  'data-[active]:bg-[color:var(--badge-emerald-bg)]',
                  'data-[active]:text-[color:var(--esap-emerald-700)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
                )}
              >
                {item.label}
              </a>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
