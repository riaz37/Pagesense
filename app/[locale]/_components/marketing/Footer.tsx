import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { type Locale } from '@/lib/i18n/config';

interface FooterColumnLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterColumnLink[];
}

interface FooterProps {
  locale: Locale;
}

export async function Footer({ locale }: FooterProps): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: 'marketing' });
  const columns = t.raw('footer.columns') as FooterColumn[];

  const resolveHref = (href: string): string => {
    if (href.startsWith('/') && !href.startsWith(`/${locale}`)) {
      return `/${locale}${href}`;
    }
    return href;
  };

  return (
    <footer className="w-full border-t border-[color:var(--border-default)] bg-[color:var(--bg-page)]">
      <div className="mx-auto max-w-[1200px] px-4 pt-14 pb-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto] md:gap-16">
          <div className="flex flex-col items-start gap-3">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
              aria-label="ESAP home"
            >
              <Image
                src="/esap_logo_white.png"
                alt="ESAP"
                width={160}
                height={48}
                className="h-12 w-auto object-contain hidden dark:block"
              />
              <Image
                src="/esap_logo_black.png"
                alt="ESAP"
                width={160}
                height={48}
                className="h-12 w-auto object-contain block dark:hidden"
              />
            </Link>
            <p
              className="m-0 max-w-[320px] text-[color:var(--text-secondary)]"
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.4 }}
            >
              {t('footer.tagline')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 md:gap-16">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <span
                  className="uppercase text-[color:var(--text-muted)]"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.125px',
                  }}
                >
                  {col.title}
                </span>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={resolveHref(link.href)}
                        className="text-[color:var(--text-secondary)] transition-colors duration-150 ease-out hover:text-[color:var(--text-primary)]"
                        style={{ fontSize: '14px', fontWeight: 500 }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-[color:var(--border-default)] pt-6 md:flex-row md:items-center">
          <span
            className="text-[color:var(--text-muted)]"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            {t('footer.copyright')}
          </span>
        </div>
      </div>
    </footer>
  );
}
