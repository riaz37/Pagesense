'use client';

import { useTranslations } from 'next-intl';

export function EmptyState() {
  const t = useTranslations('chat');
  return (
    <div
      className="flex w-full flex-col items-center px-6"
      data-testid="chat-empty"
    >
      <img
        src="/esap_logo_white.png"
        alt={t('empty.brandAlt')}
        draggable={false}
        className="h-20 w-auto select-none object-contain opacity-90 hidden dark:block"
      />
      <img
        src="/esap_logo_black.png"
        alt=""
        aria-hidden
        draggable={false}
        className="h-20 w-auto select-none object-contain opacity-90 block dark:hidden"
      />
    </div>
  );
}
