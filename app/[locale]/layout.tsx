import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import '../globals.css';
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/ThemeProvider';
import LatencyProvider from '@/components/LatencyProvider';
import { routing } from '@/lib/i18n/navigation';
import { localeDirection, type Locale } from '@/lib/i18n/config';
import { fontLatin, fontArabic } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'ESAP — Arabic Document Intelligence',
  description: 'Chat with your Arabic business documents using AI-powered retrieval',
  icons: {
    icon: [
      { url: '/logo/esaplogo.svg', type: 'image/svg+xml' },
      { url: '/favicon.webp', type: 'image/webp' },
    ],
    shortcut: '/logo/esaplogo.svg',
    apple: '/favicon.webp',
  },
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
  const themeCookie = (await cookies()).get('esap-theme')?.value;
  const theme = themeCookie === 'light' ? 'light' : 'dark';

  return (
    <html lang={locale} dir={dir} data-theme={theme} className={`h-full antialiased ${fontClass}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="h-full">
        <NextIntlClientProvider>
          <ThemeProvider initialTheme={theme}>
            <LatencyProvider>{children}</LatencyProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Toaster
          position="bottom-right"
          dir={dir}
          theme="system"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: 'rounded-xl border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]',
            },
          }}
        />
      </body>
    </html>
  );
}
