import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui';
import { Reveal, MagneticButton } from './animations';
import { type Locale } from '@/lib/i18n/config';
import { headingLetterSpacing, arLineHeight } from '@/lib/typography';

interface CTASectionProps {
  locale: Locale;
}

export async function CTASection({ locale }: CTASectionProps): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: 'marketing' });

  return (
    <section className="relative w-full bg-[color:var(--bg-page)] py-[140px]">
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-6 px-4 text-center">
        <Reveal variant="fadeUp">
          <h2
            className="m-0 text-[color:var(--text-primary)]"
            style={{
              fontSize: 'clamp(36px, 4.8vw, 54px)',
              fontWeight: 700,
              lineHeight: arLineHeight(locale, 1.04),
              letterSpacing: headingLetterSpacing(locale, '-1.875px'),
              fontFeatureSettings: '"lnum", "locl"',
            }}
          >
            {t('cta.title')}
          </h2>
        </Reveal>
        <Reveal variant="fadeUp" delay={0.08}>
          <p
            className="m-0 text-[color:var(--text-secondary)]"
            style={{ fontSize: '20px', fontWeight: 500, lineHeight: 1.4 }}
          >
            {t('cta.subtitle')}
          </p>
        </Reveal>
        <Reveal variant="fadeUp" delay={0.16}>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton>
              <Button asChild variant="primary" size="lg">
                <Link href={`/${locale}/chat`}>{t('cta.ctaPrimary')}</Link>
              </Button>
            </MagneticButton>
            <Button asChild variant="ghost" size="lg">
              <a href="mailto:hello@esap.app">{t('cta.ctaSecondary')}</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
