import { expect, test } from '@playwright/test';
import { compareSnapshot } from '../helpers/visual';

const PRIMITIVES = [
  'button',
  'card',
  'input',
  'select',
  'pill',
  'citation',
  'language-toggle',
  'dropzone',
  'source-viewer',
  'doc-type-icon',
  'nav',
  'shell',
] as const;

type Locale = 'en' | 'ar';
type Theme = 'light' | 'dark';

const QUADRANTS: Array<{ locale: Locale; theme: Theme }> = [
  { locale: 'en', theme: 'light' },
  { locale: 'en', theme: 'dark' },
  { locale: 'ar', theme: 'light' },
  { locale: 'ar', theme: 'dark' },
];

test.describe('primitives visual baselines', () => {
  for (const { locale, theme } of QUADRANTS) {
    test(`${locale}/${theme} preview snapshots`, async ({ page }) => {
      await page.addInitScript(
        ([t]) => {
          try {
            localStorage.setItem('esap-theme', t as string);
          } catch {}
        },
        [theme],
      );
      await page.goto(`/${locale}/primitives`);
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
      }, theme);
      await page.waitForLoadState('networkidle');

      for (const primitive of PRIMITIVES) {
        const section = page.locator(`[data-primitive="${primitive}"]`);
        await expect(section).toBeVisible();
        const buffer = await section.screenshot({ animations: 'disabled' });
        const name = `primitives/${primitive}-${theme}-${locale}`;
        const result = await compareSnapshot(name, buffer, { maxDiffPixels: 300 });
        expect(
          result.match,
          `${name}: ${result.diffPixels} pixels differ from baseline`,
        ).toBe(true);
      }
    });
  }
});
