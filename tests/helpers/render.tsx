import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { defaultLocale, type Locale } from '@/lib/i18n/config';

const namespaces = ['shell', 'marketing', 'chat', 'documents', 'upload'] as const;

async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const mod = await import(`../../messages/${locale}/${ns}.json`);
      return [ns, mod.default] as const;
    })
  );
  return Object.fromEntries(entries);
}

interface TestRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: Locale;
}

export async function renderWithProviders(ui: ReactElement, options: TestRenderOptions = {}) {
  const locale = options.locale ?? defaultLocale;
  const messages = await loadMessages(locale);

  return render(ui, {
    ...options,
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    ),
  });
}
