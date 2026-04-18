import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { MarketingNav } from '../../_components/marketing/MarketingNav';
import { Footer } from '../../_components/marketing/Footer';
import { LegalToc } from './LegalToc';
import { type Locale } from '@/lib/i18n/config';

interface TocItem {
  id: string;
  label: string;
}

interface LegalShellProps {
  locale: Locale;
  title: string;
  subtitle: string;
  toc: TocItem[];
  children: React.ReactNode;
  activeKey: 'privacy' | 'terms' | 'cookies';
}

export async function LegalShell({
  locale,
  title,
  subtitle,
  toc,
  children,
  activeKey,
}: LegalShellProps): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: 'legal' });

  const pages: Array<{ key: 'privacy' | 'terms' | 'cookies'; href: string; label: string }> = [
    { key: 'privacy', href: `/${locale}/privacy`, label: t('nav.privacy') },
    { key: 'terms', href: `/${locale}/terms`, label: t('nav.terms') },
    { key: 'cookies', href: `/${locale}/cookies`, label: t('nav.cookies') },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-[color:var(--bg-page)] text-[color:var(--text-primary)]">
      <MarketingNav locale={locale} />
      <main>
        <section className="mx-auto max-w-[1200px] px-4 pt-16 pb-10 md:pt-24 md:pb-12">
          <p
            className="m-0 uppercase text-[color:var(--text-muted)]"
            style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.125px' }}
          >
            {t('meta.effectiveLabel')} · {t('meta.effectiveDate')}
          </p>
          <h1
            className="mt-3 m-0 text-[color:var(--text-primary)]"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em' }}
          >
            {title}
          </h1>
          <p
            className="mt-4 m-0 max-w-[720px] text-[color:var(--text-secondary)]"
            style={{ fontSize: '18px', fontWeight: 400, lineHeight: 1.5 }}
          >
            {subtitle}
          </p>

          <nav
            aria-label="Legal documents"
            className="mt-8 flex flex-wrap gap-2"
          >
            {pages.map((page) => {
              const isActive = page.key === activeKey;
              return (
                <Link
                  key={page.key}
                  href={page.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    isActive
                      ? 'inline-flex items-center rounded-full border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)] px-4 py-2 text-[14px] font-medium text-[color:var(--text-primary)]'
                      : 'inline-flex items-center rounded-full border border-[color:var(--border-default)] px-4 py-2 text-[14px] font-medium text-[color:var(--text-secondary)] transition-colors duration-150 ease-out hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)]'
                  }
                >
                  {page.label}
                </Link>
              );
            })}
          </nav>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 pb-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <LegalToc label={t('meta.contentsLabel')} items={toc} />
              </div>
            </aside>
            <article className="max-w-[780px]">{children}</article>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}

interface SectionProps {
  id: string;
  heading: string;
  children: React.ReactNode;
}

export function Section({ id, heading, children }: SectionProps): React.ReactElement {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[color:var(--border-default)] py-10 first:border-t-0 first:pt-0">
      <h2
        className="m-0 text-[color:var(--text-primary)]"
        style={{ fontSize: '24px', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' }}
      >
        {heading}
      </h2>
      <div className="mt-4 flex flex-col gap-4 text-[color:var(--text-secondary)]" style={{ fontSize: '16px', lineHeight: 1.6 }}>
        {children}
      </div>
    </section>
  );
}

interface ProseProps {
  children: React.ReactNode;
}

export function Prose({ children }: ProseProps): React.ReactElement {
  return (
    <p className="m-0" style={{ fontSize: '16px', lineHeight: 1.6 }}>
      {children}
    </p>
  );
}

interface BulletListProps {
  items: string[];
}

export function BulletList({ items }: BulletListProps): React.ReactElement {
  return (
    <ul className="m-0 flex list-disc list-outside flex-col gap-2 ps-6 marker:text-[color:var(--text-muted)]">
      {items.map((item, index) => (
        <li key={index} style={{ fontSize: '16px', lineHeight: 1.6 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

interface DefinitionListItem {
  label: string;
  body: string;
}

interface DefinitionListProps {
  items: DefinitionListItem[];
}

export function DefinitionList({ items }: DefinitionListProps): React.ReactElement {
  return (
    <dl className="m-0 flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <dt
            className="m-0 text-[color:var(--text-primary)]"
            style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.4 }}
          >
            {item.label}
          </dt>
          <dd className="m-0 text-[color:var(--text-secondary)]" style={{ fontSize: '16px', lineHeight: 1.6 }}>
            {item.body}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface TableProps {
  head: string[];
  rows: string[][];
  caption?: string;
}

export function Table({ head, rows, caption }: TableProps): React.ReactElement {
  return (
    <div className="overflow-x-auto rounded-xl border border-[color:var(--border-default)]">
      <table className="w-full border-collapse text-[color:var(--text-secondary)]" style={{ fontSize: '14px' }}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="bg-[color:var(--bg-surface-subtle)]">
          <tr>
            {head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="border-b border-[color:var(--border-default)] px-4 py-3 text-start text-[color:var(--text-primary)]"
                style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em' }}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="border-b border-[color:var(--border-default)] last:border-b-0">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3 align-top" style={{ lineHeight: 1.5 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
