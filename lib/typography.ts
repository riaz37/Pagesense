import { type Locale } from '@/lib/i18n/config';

export function headingLetterSpacing(locale: Locale, latinValue: string): string {
  return locale === 'ar' ? 'normal' : latinValue;
}

export function arLineHeight(locale: Locale, latin: number): number {
  return locale === 'ar' ? Number((latin + 0.1).toFixed(2)) : latin;
}
