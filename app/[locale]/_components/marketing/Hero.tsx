import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button, ContainerScroll, PillBadge } from '@/components/ui';
import { MagneticButton, Reveal } from './animations';
import HeroPlayer from './remotion/HeroPlayer';
import { type Locale } from '@/lib/i18n/config';

interface HeroProps {
  locale: Locale;
  dir: 'ltr' | 'rtl';
}

export async function Hero({ locale, dir }: HeroProps): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: 'marketing' });

  const title = (
    <div className="flex flex-col items-center gap-6">
      <Reveal variant="fadeUp" delay={0}>
        <PillBadge tone="emerald" size="lg">
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
          {t('hero.eyebrow')}
        </PillBadge>
      </Reveal>

      <Reveal variant="fadeUp" delay={0.08}>
        <h1
          id="hero-title"
          className="m-0 max-w-[920px] text-[color:var(--text-primary)]"
          style={{
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: locale === 'ar' ? '-1px' : '-2.125px',
            fontFeatureSettings: '"lnum", "locl"',
          }}
        >
          {t('hero.title')}{' '}
          <span style={{ color: 'var(--esap-emerald-700)' }}>
            {t('hero.titleAccent')}
          </span>
        </h1>
      </Reveal>

      <Reveal variant="fadeUp" delay={0.16}>
        <p
          className="mx-auto max-w-[560px] text-[color:var(--text-secondary)]"
          style={{
            fontSize: '20px',
            fontWeight: 500,
            lineHeight: 1.4,
            letterSpacing: '-0.125px',
          }}
        >
          {t('hero.subtitle')}
        </p>
      </Reveal>

      <Reveal variant="fadeUp" delay={0.24}>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton>
            <Button asChild variant="primary" size="lg">
              <Link href={`/${locale}/chat`}>{t('hero.ctaPrimary')}</Link>
            </Button>
          </MagneticButton>
          <Button asChild variant="ghost" size="lg">
            <a href="#pipeline">{t('hero.ctaSecondary')}</a>
          </Button>
        </div>
      </Reveal>
    </div>
  );

  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
      dir={dir}
    >
      <ContainerScroll titleComponent={title}>
        <HeroPlayer dir={dir} />
      </ContainerScroll>
    </section>
  );
}
