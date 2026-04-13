'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from '@/components/ThemeProvider';

export function EmptyState() {
  const t = useTranslations('chat');
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? '/esap_logo_white.png' : '/esap_logo_black.png';

  // Brand mark at 40% alpha per DESIGN.md §11 empty-state spec.
  // Tagline intentionally omitted — Composer placeholder already reads
  // "Ask about your documents." so a second line created a double-read.
  return (
    <div
      className="flex w-full flex-col items-center px-6"
      data-testid="chat-empty"
    >
      <img
        src={logoSrc}
        alt={t('empty.brandAlt')}
        width={96}
        height={96}
        className="h-24 w-24 select-none object-contain opacity-40"
        draggable={false}
      />
    </div>
  );
}
