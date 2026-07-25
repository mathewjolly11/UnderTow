import { test, expect } from '@playwright/test';

test.describe('Authentication and Navigation', () => {
  test('landing page renders correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('It catches you before the pull does.');
  });

  test('unauthenticated users are redirected from protected routes', async ({ page }) => {
    // Attempt to access dashboard without auth
    await page.goto('/dashboard');
    // Should be redirected to /auth/login
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});
