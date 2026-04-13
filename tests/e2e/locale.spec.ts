import { expect, test } from '@playwright/test';

test.describe('locale routing', () => {
  test('English route serves LTR', async ({ page }) => {
    await page.goto('/en');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
    await expect(html).toHaveAttribute('dir', 'ltr');
  });

  test('Arabic route serves RTL', async ({ page }) => {
    await page.goto('/ar');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'ar');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });

  test('root redirects to a locale prefix', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.url()).toMatch(/\/(en|ar)\/?$/);
  });
});
