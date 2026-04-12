'use client';

import * as React from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { cn } from '@/lib/cn';

export interface LanguageToggleProps {
  value: 'en' | 'ar';
  onValueChange?: (value: 'en' | 'ar') => void;
  className?: string;
  'aria-label'?: string;
}

export function LanguageToggle({
  value,
  onValueChange,
  className,
  'aria-label': ariaLabel = 'Language',
}: LanguageToggleProps) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v === 'en' || v === 'ar') onValueChange?.(v);
      }}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full',
        'border border-black/10 dark:border-white/10 bg-[color:var(--bg-surface)] p-0.5',
        className,
      )}
    >
      {(['en', 'ar'] as const).map((lang) => (
        <ToggleGroup.Item
          key={lang}
          value={lang}
          aria-label={lang === 'en' ? 'English' : 'Arabic'}
          className={cn(
            'min-w-[32px] rounded-full px-2.5 py-1 text-xs font-semibold uppercase',
            'text-[color:var(--text-secondary)]',
            'transition-colors',
            'data-[state=on]:bg-[color:var(--badge-emerald-bg)]',
            'data-[state=on]:text-[color:var(--badge-emerald-text-dark)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
          )}
        >
          {lang.toUpperCase()}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
