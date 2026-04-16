'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { Button, LanguageToggle } from '@/components/ui';
import { cn } from '@/lib/cn';
import { type Locale } from '@/lib/i18n/config';
import { usePathname, useRouter } from '@/lib/i18n/navigation';

interface MarketingNavProps {
  locale: Locale;
}

const NAV_ANCHORS = [
  { id: 'problem', key: 'nav.problem' },
  { id: 'pipeline', key: 'nav.pipeline' },
  { id: 'features', key: 'nav.features' },
] as const;

export function MarketingNav({ locale }: MarketingNavProps): React.ReactElement {
  const t = useTranslations('marketing');
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const handleLanguageChange = (next: Locale): void => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-[250ms] ease-out',
        scrolled
          ? 'backdrop-blur-xl bg-[color:var(--bg-surface)]/80 border-b border-[color:var(--border-default)]'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
          aria-label="ESAP home"
        >
          <Image
            src="/esap_logo_white.png"
            alt="ESAP"
            width={160}
            height={48}
            priority
            className="h-12 w-auto object-contain hidden dark:block"
          />
          <Image
            src="/esap_logo_black.png"
            alt="ESAP"
            width={160}
            height={48}
            priority
            className="h-12 w-auto object-contain block dark:hidden"
          />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-8"
        >
          {NAV_ANCHORS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                'text-[15px] font-medium leading-none',
                'text-[color:var(--text-secondary)]',
                'transition-colors duration-150 ease-out',
                'hover:text-[color:var(--text-primary)]',
                'focus-visible:outline-none focus-visible:text-[color:var(--text-primary)]',
              )}
            >
              {t(item.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Button asChild variant="primary" size="md">
              <Link href={`/${locale}/chat`}>{t('nav.ctaPrimary')}</Link>
            </Button>
          </div>
          <button
            type="button"
            className={cn(
              'md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full',
              'text-[color:var(--text-primary)]',
              'hover:bg-[color:var(--bg-control)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
            )}
            aria-expanded={mobileOpen}
            aria-controls="marketing-nav-mobile"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X size={20} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="marketing-nav-mobile"
          className={cn(
            'md:hidden',
            'border-t border-[color:var(--border-default)]',
            'bg-[color:var(--bg-surface)]',
          )}
        >
          <nav
            aria-label="Mobile primary"
            className="mx-auto flex max-w-[1200px] flex-col gap-1 px-4 py-4"
          >
            {NAV_ANCHORS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-md px-3 py-3 text-[16px] font-medium',
                  'text-[color:var(--text-primary)]',
                  'hover:bg-[color:var(--bg-surface-subtle)]',
                )}
              >
                {t(item.key)}
              </a>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-[color:var(--border-default)] pt-4">
              <LanguageToggle
                value={locale}
                onValueChange={handleLanguageChange}
              />
              <Button asChild variant="primary" size="md">
                <Link
                  href={`/${locale}/chat`}
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.ctaPrimary')}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
