import { getTranslations } from 'next-intl/server';
import { Card, PillBadge } from '@/components/ui';
import { Reveal } from './animations';

interface BilingualProofSectionProps {
  locale: string;
}

export async function BilingualProofSection({
  locale,
}: BilingualProofSectionProps): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: 'marketing' });

  return (
    <section
      className="relative w-full bg-[color:var(--bg-page)] py-[120px]"
      aria-labelledby="bilingual-title"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="mb-14 flex flex-col items-start gap-5">
          <Reveal variant="fadeUp">
            <PillBadge tone="emerald" size="lg"><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{t('bilingualProof.eyebrow')}</PillBadge>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.08}>
            <h2
              id="bilingual-title"
              className="m-0 max-w-[920px] text-[color:var(--text-primary)]"
              style={{
                fontSize: 'clamp(32px, 4.2vw, 48px)',
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-1.5px',
                fontFeatureSettings: '"lnum", "locl"',
              }}
            >
              {t('bilingualProof.title')}
            </h2>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.16}>
            <p
              className="max-w-[560px] text-[color:var(--text-secondary)]"
              style={{ fontSize: '20px', fontWeight: 500, lineHeight: 1.4 }}
            >
              {t('bilingualProof.subtitle')}
            </p>
          </Reveal>
        </div>

        <Reveal variant="fadeUp" delay={0.1}>
          <div className="mx-auto max-w-[640px]">
            {locale === 'ar' ? (
              <InvoiceCard
                dir="rtl"
                title={t('bilingualProof.invoiceTitleAr')}
                rows={[
                  {
                    label: t('bilingualProof.issuerLabelAr'),
                    value: t('bilingualProof.issuerValueAr'),
                  },
                  {
                    label: t('bilingualProof.dateLabelAr'),
                    value: t('bilingualProof.dateValueAr'),
                  },
                  {
                    label: t('bilingualProof.totalLabelAr'),
                    value: t('bilingualProof.totalValue'),
                    emphasis: true,
                  },
                ]}
              />
            ) : (
              <InvoiceCard
                dir="ltr"
                title={t('bilingualProof.invoiceTitleEn')}
                rows={[
                  {
                    label: t('bilingualProof.issuerLabelEn'),
                    value: t('bilingualProof.issuerValueEn'),
                  },
                  {
                    label: t('bilingualProof.dateLabelEn'),
                    value: t('bilingualProof.dateValue'),
                  },
                  {
                    label: t('bilingualProof.totalLabelEn'),
                    value: t('bilingualProof.totalValue'),
                    emphasis: true,
                  },
                ]}
              />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

interface InvoiceRow {
  label: string;
  value: string;
  emphasis?: boolean;
}

interface InvoiceCardProps {
  dir: 'ltr' | 'rtl';
  title: string;
  rows: InvoiceRow[];
}

function InvoiceCard({ dir, title, rows }: InvoiceCardProps): React.ReactElement {
  return (
    <Card className="h-full">
      <div
        className="flex flex-col gap-6 p-8"
        dir={dir}
      >
        <h3
          className="m-0 text-[color:var(--text-primary)]"
          style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.25px' }}
        >
          {title}
        </h3>
        <dl className="m-0 grid grid-cols-1 gap-4">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 border-t border-[color:var(--border-default)] pt-4 first:border-t-0 first:pt-0"
            >
              <dt
                className="uppercase text-[color:var(--text-muted)]"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.125px',
                }}
              >
                {row.label}
              </dt>
              <dd
                className="m-0 text-[color:var(--text-primary)]"
                style={{
                  fontSize: row.emphasis ? '18px' : '16px',
                  fontWeight: row.emphasis ? 700 : 500,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}
