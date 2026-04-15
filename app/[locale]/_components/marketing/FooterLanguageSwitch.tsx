'use client';

import { LanguageToggle } from '@/components/ui';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { type Locale } from '@/lib/i18n/config';

interface FooterLanguageSwitchProps {
  locale: Locale;
}

export function FooterLanguageSwitch({
  locale,
}: FooterLanguageSwitchProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (next: 'en' | 'ar'): void => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <LanguageToggle
      value={locale}
      onValueChange={handleChange}
      aria-label="Language"
    />
  );
}
