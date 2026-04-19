import { getTranslations } from 'next-intl/server';
import { Eye, Lightbulb, Search, Languages, Code2, Zap } from 'lucide-react';
import { Card } from '@/components/ui';
import { Reveal } from './animations';
import { headingLetterSpacing, arLineHeight } from '@/lib/typography';
import { type Locale } from '@/lib/i18n/config';

interface FeatureItem {
  title: string;
  desc: string;
}

interface FeaturesSectionProps {
  locale: string;
}

const FEATURE_ICONS = [Eye, Lightbulb, Search, Languages, Code2, Zap] as const;

export async function FeaturesSection({
  locale,
}: FeaturesSectionProps): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: 'marketing' });
  const items = t.raw('features.items') as FeatureItem[];

  return (
    <section
      id="features"
      className="relative w-full bg-[color:var(--bg-page)] py-[120px]"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="mb-16 flex flex-col items-center gap-5 text-center">
          <Reveal variant="fadeUp">
            <h2
              className="m-0 max-w-[920px] text-[color:var(--text-primary)]"
              style={{
                fontSize: 'clamp(32px, 4.2vw, 48px)',
                fontWeight: 700,
                lineHeight: arLineHeight(locale as Locale, 1.1),
                letterSpacing: headingLetterSpacing(locale as Locale, '-1.5px'),
                fontFeatureSettings: '"lnum", "locl"',
              }}
            >
              {t('features.title')}
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = FEATURE_ICONS[i] ?? Eye;
            return (
              <Reveal
                key={item.title}
                variant="fadeUp"
                delay={Math.min(i * 0.06, 0.3)}
              >
                <FeatureCard item={item} Icon={Icon} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  item: FeatureItem;
  Icon: typeof Eye;
}

function FeatureCard({ item, Icon }: FeatureCardProps): React.ReactElement {
  return (
    <Card
      className={[
        'group h-full',
        'transition-shadow duration-150 ease-out',
        'hover:shadow-[rgba(0,0,0,0.06)_0px_8px_32px,rgba(0,0,0,0.04)_0px_4px_14px,rgba(0,0,0,0.03)_0px_2px_6px,rgba(0,0,0,0.02)_0px_1px_2px]',
      ].join(' ')}
    >
      <div className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--badge-emerald-bg)] text-[color:var(--esap-emerald-500)]"
          >
            <Icon size={20} strokeWidth={1.75} />
          </span>
          <h3
            className="m-0 text-[color:var(--text-primary)]"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: '-0.25px',
            }}
          >
            {item.title}
          </h3>
        </div>
        <p
          className="mt-auto text-[color:var(--text-secondary)]"
          style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.5 }}
        >
          {item.desc}
        </p>
      </div>
    </Card>
  );
}
