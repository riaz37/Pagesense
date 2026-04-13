import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import '../globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import LatencyProvider from '@/components/LatencyProvider';
import { routing } from '@/lib/i18n/navigation';
import { localeDirection, type Locale } from '@/lib/i18n/config';
import { fontLatin, fontArabic } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'ESAP — Arabic Document Intelligence',
  description: 'Chat with your Arabic business documents using AI-powered retrieval',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#060b06' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  colorScheme: 'dark light',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const dir = localeDirection[locale as Locale];
  const fontClass = `${fontLatin.variable} ${fontArabic.variable}`;

  return (
    <html lang={locale} dir={dir} className={`h-full antialiased ${fontClass}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('esap-theme');if(t!=='light')document.documentElement.setAttribute('data-theme','dark')}catch(e){document.documentElement.setAttribute('data-theme','dark')}})()`,
          }}
        />
      </head>
      <body className="h-full">
        <NextIntlClientProvider>
          <ThemeProvider>
            <LatencyProvider>{children}</LatencyProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
