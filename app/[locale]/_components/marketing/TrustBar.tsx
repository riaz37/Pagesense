'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Marquee } from './animations';

const PARTNER_LOGO_SRCS = [
  '/partners/EMp.svg',
  '/partners/EMp-1.svg',
  '/partners/EMp-2-1.svg',
  '/partners/EMp-3.svg',
  '/partners/EMp-4.svg',
  '/partners/EMp-5.svg',
] as const;

export function TrustBar(): React.ReactElement {
  const t = useTranslations('marketing');
  const logoNames = t.raw('trustBar.logos') as string[];

  return (
    <section
      aria-label={t('trustBar.heading')}
      className="w-full bg-[color:var(--bg-page)] py-12"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <p
          className="mb-10 text-center uppercase text-[color:var(--text-muted)]"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.125px',
          }}
        >
          {t('trustBar.heading')}
        </p>
        <Marquee speed={40} pauseOnHover>
          {PARTNER_LOGO_SRCS.map((src, i) => (
            <div
              key={src}
              className="flex h-16 shrink-0 items-center justify-center px-10 opacity-80 brightness-0 invert transition-opacity duration-150 ease-out hover:opacity-100"
            >
              <Image
                src={src}
                alt={logoNames[i] ?? 'Partner'}
                width={160}
                height={64}
                className="h-14 w-auto max-w-[180px] object-contain"
              />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
