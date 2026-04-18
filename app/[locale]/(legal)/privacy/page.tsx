import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeDirection, type Locale } from '@/lib/i18n/config';
import {
  LegalShell,
  Section,
  Prose,
  BulletList,
  DefinitionList,
  Table,
} from '../_components/LegalShell';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });
  return {
    title: `${t('privacy.title')} — PageSense`,
    description: t('privacy.subtitle'),
  };
}

interface DefinitionEntry {
  label: string;
  body: string;
}

interface WhyRow {
  purpose: string;
  basis: string;
}

interface SubRow {
  provider: string;
  purpose: string;
  location: string;
}

interface RetentionRow {
  dataType: string;
  period: string;
}

export default async function PrivacyPage({ params }: PageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  // Ensure direction is consumed (for layout isomorphism with other pages)
  void localeDirection[typedLocale];

  const t = await getTranslations({ locale, namespace: 'legal' });

  const sectionIds = [
    { id: 'who-we-are', labelKey: 'privacy.sections.whoWeAre.heading' },
    { id: 'role', labelKey: 'privacy.sections.role.heading' },
    { id: 'sensitivity', labelKey: 'privacy.sections.sensitivity.heading' },
    { id: 'what-we-process', labelKey: 'privacy.sections.whatWeProcess.heading' },
    { id: 'why', labelKey: 'privacy.sections.why.heading' },
    { id: 'ai', labelKey: 'privacy.sections.ai.heading' },
    { id: 'subprocessors', labelKey: 'privacy.sections.subprocessors.heading' },
    { id: 'transfers', labelKey: 'privacy.sections.transfers.heading' },
    { id: 'rights', labelKey: 'privacy.sections.rights.heading' },
    { id: 'retention', labelKey: 'privacy.sections.retention.heading' },
    { id: 'security', labelKey: 'privacy.sections.security.heading' },
    { id: 'contact', labelKey: 'privacy.sections.contact.heading' },
  ];

  const toc = sectionIds.map((s) => ({ id: s.id, label: t(s.labelKey) }));

  const responsibilities = t.raw('privacy.sections.sensitivity.responsibilities') as string[];
  const whatItems = t.raw('privacy.sections.whatWeProcess.items') as DefinitionEntry[];
  const whyRows = t.raw('privacy.sections.why.rows') as WhyRow[];
  const aiItems = t.raw('privacy.sections.ai.items') as string[];
  const subRows = t.raw('privacy.sections.subprocessors.rows') as SubRow[];
  const transfersItems = t.raw('privacy.sections.transfers.items') as string[];
  const rightsItems = t.raw('privacy.sections.rights.items') as DefinitionEntry[];
  const retentionRows = t.raw('privacy.sections.retention.rows') as RetentionRow[];
  const securityItems = t.raw('privacy.sections.security.items') as string[];

  return (
    <LegalShell
      locale={typedLocale}
      title={t('privacy.title')}
      subtitle={t('privacy.subtitle')}
      toc={toc}
      activeKey="privacy"
    >
      <Section id="who-we-are" heading={t('privacy.sections.whoWeAre.heading')}>
        <Prose>{t('privacy.sections.whoWeAre.body')}</Prose>
      </Section>

      <Section id="role" heading={t('privacy.sections.role.heading')}>
        <Prose>{t('privacy.sections.role.body')}</Prose>
      </Section>

      <Section id="sensitivity" heading={t('privacy.sections.sensitivity.heading')}>
        <Prose>{t('privacy.sections.sensitivity.body')}</Prose>
        <Prose>{t('privacy.sections.sensitivity.responsibilitiesLabel')}</Prose>
        <BulletList items={responsibilities} />
      </Section>

      <Section id="what-we-process" heading={t('privacy.sections.whatWeProcess.heading')}>
        <DefinitionList items={whatItems} />
      </Section>

      <Section id="why" heading={t('privacy.sections.why.heading')}>
        <Table
          head={[
            t('privacy.sections.why.tableHead.purpose'),
            t('privacy.sections.why.tableHead.basis'),
          ]}
          rows={whyRows.map((r) => [r.purpose, r.basis])}
        />
        <Prose>{t('privacy.sections.why.footer')}</Prose>
      </Section>

      <Section id="ai" heading={t('privacy.sections.ai.heading')}>
        <BulletList items={aiItems} />
      </Section>

      <Section id="subprocessors" heading={t('privacy.sections.subprocessors.heading')}>
        <Table
          head={[
            t('privacy.sections.subprocessors.tableHead.provider'),
            t('privacy.sections.subprocessors.tableHead.purpose'),
            t('privacy.sections.subprocessors.tableHead.location'),
          ]}
          rows={subRows.map((r) => [r.provider, r.purpose, r.location])}
        />
        <Prose>{t('privacy.sections.subprocessors.footer')}</Prose>
      </Section>

      <Section id="transfers" heading={t('privacy.sections.transfers.heading')}>
        <BulletList items={transfersItems} />
      </Section>

      <Section id="rights" heading={t('privacy.sections.rights.heading')}>
        <DefinitionList items={rightsItems} />
        <Prose>{t('privacy.sections.rights.contact')}</Prose>
      </Section>

      <Section id="retention" heading={t('privacy.sections.retention.heading')}>
        <Table
          head={[
            t('privacy.sections.retention.tableHead.dataType'),
            t('privacy.sections.retention.tableHead.period'),
          ]}
          rows={retentionRows.map((r) => [r.dataType, r.period])}
        />
        <Prose>{t('privacy.sections.retention.footer')}</Prose>
      </Section>

      <Section id="security" heading={t('privacy.sections.security.heading')}>
        <BulletList items={securityItems} />
      </Section>

      <Section id="contact" heading={t('privacy.sections.contact.heading')}>
        <Prose>{t('privacy.sections.contact.body')}</Prose>
        <Prose>
          {t('privacy.sections.contact.email')} · {t('privacy.sections.contact.portal')}
        </Prose>
        <Prose>{t('privacy.sections.contact.complaints')}</Prose>
      </Section>
    </LegalShell>
  );
}
