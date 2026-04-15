'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Marquee } from './animations';

const PARTNER_LOGOS = [
  { src: '/partners/EMp.svg', alt: 'Partner 1' },
  { src: '/partners/EMp-1.svg', alt: 'Partner 2' },
  { src: '/partners/EMp-2-1.svg', alt: 'Partner 3' },
  { src: '/partners/EMp-3.svg', alt: 'Partner 4' },
  { src: '/partners/EMp-4.svg', alt: 'Partner 5' },
  { src: '/partners/EMp-5.svg', alt: 'Partner 6' },
] as const;

export function TrustBar(): React.ReactElement {
  const t = useTranslations('marketing');

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
          {PARTNER_LOGOS.map((logo) => (
            <div
              key={logo.src}
              className="flex h-16 shrink-0 items-center justify-center px-10 opacity-80 brightness-0 invert transition-opacity duration-150 ease-out hover:opacity-100"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
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
