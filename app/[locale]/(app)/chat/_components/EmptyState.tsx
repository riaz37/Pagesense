'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from '@/components/ThemeProvider';

export function EmptyState() {
  const t = useTranslations('chat');
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? '/esap_logo_white.png' : '/esap_logo_black.png';

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center px-6"
      data-testid="chat-empty"
    >
      <div className="flex flex-col items-center gap-6">
        <img
          src={logoSrc}
          alt={t('empty.brandAlt')}
          width={96}
          height={96}
          className="h-24 w-24 select-none object-contain"
          draggable={false}
        />
        <p
          className="text-center text-[15px] leading-[1.5] text-[color:var(--text-secondary)]"
          dir="auto"
        >
          {t('empty.title')}
        </p>
      </div>
    </div>
  );
}
