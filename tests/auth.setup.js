const { test, expect } = require('@playwright/test');
const testData = require('../fixtures/testData.json');

test('authenticate', async ({ page }) => {
  test.setTimeout(240_000);

  await page.goto(testData.login.urlPath, {
    waitUntil: 'commit',
    timeout: 120_000
  });

  await page.waitForURL(/bps-identity-staging\.azurewebsites\.net\/login/i, {
    timeout: 120_000
  });

  const usernameInput = page.getByRole('textbox', { name: /email address/i });
  const passwordInput = page.getByRole('textbox', { name: /password/i });
  const loginButton = page.getByRole('button', { name: /^login$/i });

  await expect(usernameInput).toBeVisible({ timeout: 60_000 });
  await usernameInput.fill(testData.login.username);

  await expect(passwordInput).toBeVisible({ timeout: 60_000 });
  await passwordInput.fill(testData.login.password);

  await expect(loginButton).toBeVisible({ timeout: 60_000 });
  await loginButton.click();

  await page.waitForURL(/adora-v3-staging\.azurewebsites\.net\/global-landing-page/i, {
    timeout: 120_000
  });

  await expect(
    page.getByText('What would you like to do today?', { exact: true })
  ).toBeVisible({ timeout: 120_000 });

  await page.context().storageState({
    path: 'playwright/.auth/user.json'
  });
});