// Per-context numeral policy (PLAN D3):
// - AR message content → Arabic-Indic (٠١٢٣)
// - UI chrome (timestamps, page refs, counts) → Western (0123) regardless of locale
// Callers choose `context` explicitly; default is `chrome`.

const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

export type NumeralContext = 'content' | 'chrome';

export function toArabicIndic(value: string | number): string {
  return String(value).replace(/\d/g, (d) => ARABIC_INDIC[Number(d)]);
}

export function formatNumber(
  value: number | string,
  locale: string,
  context: NumeralContext = 'chrome',
): string {
  if (locale === 'ar' && context === 'content') return toArabicIndic(value);
  return String(value);
}
