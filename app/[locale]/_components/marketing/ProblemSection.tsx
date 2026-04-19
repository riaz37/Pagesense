import { getTranslations } from 'next-intl/server';
import { PillBadge } from '@/components/ui';
import { Reveal } from './animations';
import { headingLetterSpacing, arLineHeight } from '@/lib/typography';
import { type Locale } from '@/lib/i18n/config';

interface ProblemItem {
  title: string;
  desc: string;
}

interface ProblemSectionProps {
  locale: string;
}

const INDEX_LATIN = ['01', '02', '03', '04', '05', '06'] as const;
const INDEX_ARABIC = ['٠١', '٠٢', '٠٣', '٠٤', '٠٥', '٠٦'] as const;

export async function ProblemSection({
  locale,
}: ProblemSectionProps): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: 'marketing' });
  const items = t.raw('problem.items') as ProblemItem[];
  const isArabic = locale === 'ar';
  const indexLabels = isArabic ? INDEX_ARABIC : INDEX_LATIN;

  return (
    <section
      id="problem"
      className="relative w-full bg-[color:var(--bg-page)] py-[120px]"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal variant="fadeUp">
              <PillBadge tone="emerald" size="lg">
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                {t('problem.eyebrow')}
              </PillBadge>
            </Reveal>
            <Reveal variant="fadeUp" delay={0.08}>
              <h2
                className="m-0 mt-5 text-[color:var(--text-primary)]"
                style={{
                  fontSize: 'clamp(32px, 4.2vw, 48px)',
                  fontWeight: 700,
                  lineHeight: arLineHeight(locale as Locale, 1.05),
                  letterSpacing: headingLetterSpacing(locale as Locale, '-1.5px'),
                  fontFeatureSettings: '"lnum", "locl"',
                }}
              >
                {t('problem.title')}
              </h2>
            </Reveal>
          </div>

          <ol className="m-0 list-none p-0">
            {items.map((item, i) => (
              <Reveal
                key={item.title}
                variant="fadeUp"
                delay={Math.min(i * 0.05, 0.3)}
              >
                <li
                  className={[
                    'grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 py-7',
                    'border-b border-[color:var(--border-subtle)]',
                    i === 0 ? 'border-t' : '',
                  ].join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className="text-[color:var(--text-tertiary)] tabular-nums"
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {indexLabels[i]}
                  </span>
                  <h3
                    className="m-0 text-[color:var(--text-primary)]"
                    style={{
                      fontSize: 'clamp(20px, 2.2vw, 26px)',
                      fontWeight: 700,
                      lineHeight: arLineHeight(locale as Locale, 1.25),
                      letterSpacing: headingLetterSpacing(locale as Locale, '-0.5px'),
                    }}
                  >
                    {item.title}
                  </h3>
                  <span aria-hidden="true" />
                  <p
                    className="m-0 text-[color:var(--text-secondary)]"
                    style={{
                      fontSize: '16px',
                      fontWeight: 400,
                      lineHeight: arLineHeight(locale as Locale, 1.5),
                      maxWidth: '56ch',
                    }}
                  >
                    {item.desc}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
