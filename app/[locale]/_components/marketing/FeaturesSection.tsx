import { getTranslations } from 'next-intl/server';
import { PillBadge } from '@/components/ui';
import { Reveal } from './animations';

interface FeatureItem {
  title: string;
  desc: string;
}

interface FeaturesSectionProps {
  locale: string;
}

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
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <div className="flex flex-col items-start gap-5">
              <Reveal variant="fadeUp">
                <PillBadge tone="emerald" size="lg"><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{t('features.eyebrow')}</PillBadge>
              </Reveal>
              <Reveal variant="fadeUp" delay={0.08}>
                <h2
                  className="m-0 text-[color:var(--text-primary)]"
                  style={{
                    fontSize: 'clamp(32px, 4.2vw, 48px)',
                    fontWeight: 700,
                    lineHeight: 1.05,
                    letterSpacing: '-1.5px',
                    fontFeatureSettings: '"lnum", "locl"',
                  }}
                >
                  {t('features.title')}
                </h2>
              </Reveal>
              <Reveal variant="fadeUp" delay={0.16}>
                <p
                  className="max-w-[440px] text-[color:var(--text-secondary)]"
                  style={{ fontSize: '20px', fontWeight: 500, lineHeight: 1.4 }}
                >
                  {t('features.subtitle')}
                </p>
              </Reveal>
            </div>
          </div>

          <ol className="lg:col-span-7 m-0 list-none p-0">
            {items.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                variant="fadeUp"
                delay={Math.min(i * 0.06, 0.4)}
                className={[
                  'flex flex-col gap-2',
                  'py-6',
                  i === 0 ? '' : 'border-t border-[color:var(--border-default)]',
                ].join(' ')}
              >
                <FeatureRow index={i + 1} item={item} />
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

interface FeatureRowProps {
  index: number;
  item: FeatureItem;
}

function FeatureRow({ index, item }: FeatureRowProps): React.ReactElement {
  const paddedIndex = index.toString().padStart(2, '0');
  return (
    <div className="group flex flex-col gap-2">
      <span
        className="text-[color:var(--text-muted)]"
        style={{
          fontFamily: 'var(--font-latin)',
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.125px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {paddedIndex}
      </span>
      <h3
        className="m-0 text-[color:var(--text-primary)] transition-colors duration-150 ease-out"
        style={{
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: '-0.25px',
        }}
      >
        {item.title}
      </h3>
      <p
        className="m-0 max-w-[560px] text-[color:var(--text-secondary)] transition-colors duration-150 ease-out group-hover:text-[color:var(--text-primary)]"
        style={{ fontSize: '16px', fontWeight: 400, lineHeight: 1.55 }}
      >
        {item.desc}
      </p>
    </div>
  );
}
