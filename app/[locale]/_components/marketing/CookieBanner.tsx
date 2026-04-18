'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

const STORAGE_KEY = 'pagesense-cookie-consent';

type ConsentChoice = 'accepted' | 'declined';

interface StoredConsent {
  choice: ConsentChoice;
  timestamp: number;
  version: 3;
}

function readConsent(): StoredConsent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed.version !== 3) return null;
    if (parsed.choice !== 'accepted' && parsed.choice !== 'declined') return null;
    if (typeof parsed.timestamp !== 'number') return null;
    return parsed as StoredConsent;
  } catch {
    return null;
  }
}

function writeConsent(choice: ConsentChoice): void {
  try {
    const payload: StoredConsent = {
      choice,
      timestamp: Date.now(),
      version: 3,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

export function CookieBanner(): React.ReactElement | null {
  const t = useTranslations('legal');
  const locale = useLocale();
  const [visible, setVisible] = useState<boolean>(false);
  const [closing, setClosing] = useState<boolean>(false);

  useEffect(() => {
    if (!readConsent()) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, []);

  const handleChoice = (choice: ConsentChoice): void => {
    writeConsent(choice);
    setClosing(true);
    window.setTimeout(() => setVisible(false), 220);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-modal="false"
      aria-label={t('cookies.sections.banner.title')}
      className={cn(
        'fixed inset-x-0 bottom-0 z-[60] px-4 pb-4',
        'sm:inset-x-auto sm:bottom-6 sm:end-6 sm:max-w-[440px] sm:px-0 sm:pb-0',
        'pointer-events-none',
      )}
    >
      <div
        className={cn(
          'pointer-events-auto overflow-hidden rounded-[16px]',
          'border border-[color:var(--border-default)]',
          'bg-[color:var(--bg-surface)]',
          'shadow-[rgba(0,0,0,0.01)_0px_1px_3px,rgba(0,0,0,0.02)_0px_3px_7px,rgba(0,0,0,0.02)_0px_7px_15px,rgba(0,0,0,0.04)_0px_14px_28px,rgba(0,0,0,0.05)_0px_23px_52px]',
          'transition-[opacity,transform] duration-[220ms] ease-out',
          closing ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
        )}
      >
        <div className="p-5 sm:p-6">
          <h2
            className="m-0 text-[color:var(--text-primary)]"
            style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.3px' }}
          >
            {t('cookies.sections.banner.title')}
          </h2>

          <p
            className="mt-2 m-0 text-[color:var(--text-secondary)]"
            style={{ fontSize: '13.5px', lineHeight: 1.55 }}
          >
            {t('cookies.sections.banner.body')}
          </p>

          <div
            className={cn(
              'mt-4 flex flex-col gap-3',
              'sm:flex-row sm:items-center sm:justify-between sm:gap-4',
            )}
          >
            <a
              href={`/${locale}/cookies`}
              className={cn(
                'text-[13px] font-medium text-[color:var(--text-secondary)]',
                'underline underline-offset-[3px] decoration-[color:var(--border-default)]',
                'transition-colors duration-150 ease-out',
                'hover:text-[color:var(--text-primary)] hover:decoration-[color:var(--text-primary)]',
                'focus-visible:outline-none focus-visible:text-[color:var(--text-primary)]',
              )}
            >
              {t('cookies.sections.banner.learnMore')}
            </a>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleChoice('declined')}
              >
                {t('cookies.sections.banner.decline')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleChoice('accepted')}
                autoFocus
              >
                {t('cookies.sections.banner.accept')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
