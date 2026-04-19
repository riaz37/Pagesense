'use client';

import { useTranslations, useLocale } from 'next-intl';
import { PillBadge } from '@/components/ui';
import { Reveal, Counter } from './animations';
import { headingLetterSpacing, arLineHeight } from '@/lib/typography';
import { type Locale } from '@/lib/i18n/config';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export function StatsSection(): React.ReactElement {
  const t = useTranslations('marketing');
  const locale = useLocale() as Locale;
  const items = t.raw('stats.items') as StatItem[];

  const formatValue = (value: number): string => {
    if (Number.isInteger(value)) {
      return Math.round(value).toLocaleString('en-US');
    }
    return value.toFixed(1);
  };

  return (
    <section className="relative w-full bg-[color:var(--bg-page)] py-[120px]">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="mb-16 flex flex-col items-center gap-5 text-center">
          <Reveal variant="fadeUp">
            <PillBadge tone="emerald" size="lg"><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{t('stats.eyebrow')}</PillBadge>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.08}>
            <h2
              className="m-0 max-w-[920px] text-[color:var(--text-primary)]"
              style={{
                fontSize: 'clamp(32px, 4.2vw, 48px)',
                fontWeight: 700,
                lineHeight: arLineHeight(locale, 1.05),
                letterSpacing: headingLetterSpacing(locale, '-1.5px'),
                fontFeatureSettings: '"lnum", "locl"',
              }}
            >
              {t('stats.title')}
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-3 lg:grid-cols-3 lg:gap-x-10">
          {items.map((stat, i) => (
            <Reveal
              key={stat.label}
              variant="fadeUp"
              delay={i * 0.1}
              className={[
                'py-8 sm:px-6 sm:py-8 lg:py-0',
                // Mobile: horizontal rule above every item except the first
                i > 0 ? 'border-t border-[color:var(--border-default)] sm:border-t-0' : '',
                // Tablet (2-col): horizontal rule above items in row 2+
                i >= 2 ? 'sm:border-t sm:border-[color:var(--border-default)]' : '',
                // Desktop (4-col): inline-start rhythm border, no top border
                i > 0 ? 'lg:border-s lg:border-t-0 lg:border-[color:var(--border-default)]' : '',
              ].join(' ')}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <span
                  className="block whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-latin)',
                    fontSize: 'clamp(40px, 4.2vw, 56px)',
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '-1.5px',
                    color: 'var(--esap-emerald-700)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <Counter
                    value={stat.value}
                    suffix={stat.suffix}
                    format={formatValue}
                  />
                </span>
                <span
                  className="max-w-[200px] text-[color:var(--text-secondary)]"
                  style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.4 }}
                >
                  {stat.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
