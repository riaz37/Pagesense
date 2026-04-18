import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeDirection, type Locale } from '@/lib/i18n/config';
import {
  LegalShell,
  Section,
  Prose,
  Table,
} from '../_components/LegalShell';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });
  return {
    title: `${t('cookies.title')} — PageSense`,
    description: t('cookies.subtitle'),
  };
}

interface CookieRow {
  name: string;
  type: string;
  purpose: string;
  duration: string;
}

export default async function CookiesPage({ params }: PageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  void localeDirection[typedLocale];

  const t = await getTranslations({ locale, namespace: 'legal' });

  const sectionIds = [
    { id: 'overview', labelKey: 'cookies.sections.overview.heading' },
    { id: 'table', labelKey: 'cookies.sections.table.heading' },
  ];
  const toc = sectionIds.map((s) => ({ id: s.id, label: t(s.labelKey) }));

  const rows = t.raw('cookies.sections.table.rows') as CookieRow[];

  return (
    <LegalShell
      locale={typedLocale}
      title={t('cookies.title')}
      subtitle={t('cookies.subtitle')}
      toc={toc}
      activeKey="cookies"
    >
      <Section id="overview" heading={t('cookies.sections.overview.heading')}>
        <Prose>{t('cookies.sections.banner.body')}</Prose>
        <Prose>{t('cookies.sections.banner.notice')}</Prose>
      </Section>

      <Section id="table" heading={t('cookies.sections.table.heading')}>
        <Table
          head={[
            t('cookies.sections.table.tableHead.name'),
            t('cookies.sections.table.tableHead.type'),
            t('cookies.sections.table.tableHead.purpose'),
            t('cookies.sections.table.tableHead.duration'),
          ]}
          rows={rows.map((r) => [r.name, r.type, r.purpose, r.duration])}
        />
        <Prose>{t('cookies.sections.table.footer')}</Prose>
      </Section>
    </LegalShell>
  );
}
