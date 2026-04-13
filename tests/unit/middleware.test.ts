import { describe, expect, it } from 'vitest';
import { isLocale, defaultLocale, locales } from '@/lib/i18n/config';

describe('i18n config', () => {
  it('exposes en and ar locales', () => {
    expect(locales).toEqual(['en', 'ar']);
  });

  it('defaults to en', () => {
    expect(defaultLocale).toBe('en');
  });

  it('isLocale accepts supported values only', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('ar')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
  });
});
