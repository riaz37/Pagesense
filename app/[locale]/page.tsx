import { setRequestLocale } from 'next-intl/server';
import { MarketingNav } from './_components/marketing/MarketingNav';
import { Hero } from './_components/marketing/Hero';
import { TrustBar } from './_components/marketing/TrustBar';
import { ProblemSection } from './_components/marketing/ProblemSection';
import { PipelineSection } from './_components/marketing/PipelineSection';
import { FeaturesSection } from './_components/marketing/FeaturesSection';
import { BilingualProofSection } from './_components/marketing/BilingualProofSection';
import { StatsSection } from './_components/marketing/StatsSection';
import { CTASection } from './_components/marketing/CTASection';
import { Footer } from './_components/marketing/Footer';
import { CookieBanner } from './_components/marketing/CookieBanner';
import { localeDirection, type Locale } from '@/lib/i18n/config';

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LandingPage({
  params,
}: LandingPageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  const dir = localeDirection[typedLocale] ?? 'ltr';

  return (
    <div className="min-h-screen overflow-x-clip bg-[color:var(--bg-page)] text-[color:var(--text-primary)]">
      <MarketingNav locale={typedLocale} />
      <main>
        <Hero locale={typedLocale} dir={dir} />
        <TrustBar />
        <ProblemSection locale={locale} />
        <PipelineSection />
        <FeaturesSection locale={locale} />
        <BilingualProofSection />
        <StatsSection />
        <CTASection locale={typedLocale} />
      </main>
      <Footer locale={typedLocale} />
      <CookieBanner />
    </div>
  );
}
