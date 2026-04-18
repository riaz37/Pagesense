import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeDirection, type Locale } from '@/lib/i18n/config';
import {
  LegalShell,
  Section,
  Prose,
  BulletList,
  DefinitionList,
} from '../_components/LegalShell';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });
  return {
    title: `${t('terms.title')} — PageSense`,
    description: t('terms.subtitle'),
  };
}

interface DefinitionEntry {
  label: string;
  body: string;
}

export default async function TermsPage({ params }: PageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  void localeDirection[typedLocale];

  const t = await getTranslations({ locale, namespace: 'legal' });

  const sectionIds = [
    { id: 'agreement', labelKey: 'terms.sections.agreement.heading' },
    { id: 'description', labelKey: 'terms.sections.description.heading' },
    { id: 'access', labelKey: 'terms.sections.access.heading' },
    { id: 'upload', labelKey: 'terms.sections.uploadResponsibility.heading' },
    { id: 'acceptable', labelKey: 'terms.sections.acceptable.heading' },
    { id: 'ai', labelKey: 'terms.sections.aiDisclaimer.heading' },
    { id: 'client-data', labelKey: 'terms.sections.clientData.heading' },
    { id: 'privacy', labelKey: 'terms.sections.privacy.heading' },
    { id: 'pricing', labelKey: 'terms.sections.pricing.heading' },
    { id: 'standard', labelKey: 'terms.sections.standard.heading' },
    { id: 'contact', labelKey: 'terms.sections.contact.heading' },
  ];
  const toc = sectionIds.map((s) => ({ id: s.id, label: t(s.labelKey) }));

  const descriptionItems = t.raw('terms.sections.description.items') as string[];
  const accessItems = t.raw('terms.sections.access.items') as DefinitionEntry[];
  const uploadItems = t.raw('terms.sections.uploadResponsibility.items') as string[];
  const acceptableItems = t.raw('terms.sections.acceptable.items') as string[];
  const aiItems = t.raw('terms.sections.aiDisclaimer.items') as string[];
  const clientDataItems = t.raw('terms.sections.clientData.items') as string[];

  return (
    <LegalShell
      locale={typedLocale}
      title={t('terms.title')}
      subtitle={t('terms.subtitle')}
      toc={toc}
      activeKey="terms"
    >
      <Section id="agreement" heading={t('terms.sections.agreement.heading')}>
        <Prose>{t('terms.sections.agreement.body')}</Prose>
      </Section>

      <Section id="description" heading={t('terms.sections.description.heading')}>
        <BulletList items={descriptionItems} />
      </Section>

      <Section id="access" heading={t('terms.sections.access.heading')}>
        <Prose>{t('terms.sections.access.body')}</Prose>
        <DefinitionList items={accessItems} />
        <Prose>{t('terms.sections.access.footer')}</Prose>
      </Section>

      <Section id="upload" heading={t('terms.sections.uploadResponsibility.heading')}>
        <Prose>{t('terms.sections.uploadResponsibility.intro')}</Prose>
        <BulletList items={uploadItems} />
        <Prose>{t('terms.sections.uploadResponsibility.footer')}</Prose>
      </Section>

      <Section id="acceptable" heading={t('terms.sections.acceptable.heading')}>
        <Prose>{t('terms.sections.acceptable.intro')}</Prose>
        <BulletList items={acceptableItems} />
      </Section>

      <Section id="ai" heading={t('terms.sections.aiDisclaimer.heading')}>
        <BulletList items={aiItems} />
      </Section>

      <Section id="client-data" heading={t('terms.sections.clientData.heading')}>
        <Prose>{t('terms.sections.clientData.intro')}</Prose>
        <BulletList items={clientDataItems} />
      </Section>

      <Section id="privacy" heading={t('terms.sections.privacy.heading')}>
        <Prose>{t('terms.sections.privacy.body')}</Prose>
      </Section>

      <Section id="pricing" heading={t('terms.sections.pricing.heading')}>
        <Prose>{t('terms.sections.pricing.body')}</Prose>
      </Section>

      <Section id="standard" heading={t('terms.sections.standard.heading')}>
        <Prose>{t('terms.sections.standard.body')}</Prose>
      </Section>

      <Section id="contact" heading={t('terms.sections.contact.heading')}>
        <Prose>{t('terms.sections.contact.body')}</Prose>
        <Prose>
          {t('terms.sections.contact.email')} · {t('terms.sections.contact.portal')}
        </Prose>
      </Section>
    </LegalShell>
  );
}
