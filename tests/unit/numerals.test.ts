import { describe, expect, it } from 'vitest';
import { formatNumber, toArabicIndic } from '@/lib/numerals';

describe('numerals', () => {
  it('converts Western digits to Arabic-Indic', () => {
    expect(toArabicIndic('page 12 of 34')).toBe('page ١٢ of ٣٤');
    expect(toArabicIndic(2026)).toBe('٢٠٢٦');
  });

  it('keeps Western numerals in chrome context regardless of locale (D3)', () => {
    expect(formatNumber(3, 'ar', 'chrome')).toBe('3');
    expect(formatNumber(3, 'en', 'chrome')).toBe('3');
    expect(formatNumber(3, 'en', 'content')).toBe('3');
  });

  it('uses Arabic-Indic for AR content context (D3)', () => {
    expect(formatNumber(7, 'ar', 'content')).toBe('٧');
    expect(formatNumber('2026-04-13', 'ar', 'content')).toBe('٢٠٢٦-٠٤-١٣');
  });
});
