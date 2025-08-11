import { test, expect } from '@playwright/test';

test('app loads and renders dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/cyber|security|dash/i);
  // Adjust selectors to your UI:
  const header = page.getByRole('heading', { level: 1 });
  await expect(header).toBeVisible();
});
