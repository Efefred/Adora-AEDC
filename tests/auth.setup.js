// const { test, expect } = require('@playwright/test');
// const testData = require('../fixtures/testData.json');

// test('authenticate', async ({ page }) => {
//   await page.goto(testData.login.urlPath, {
//     waitUntil: 'domcontentloaded',
//     timeout: 60_000
//   });

//   const usernameInput = page.locator('input[placeholder="Email Address"]:visible').first();
//   const passwordInput = page.locator('input[type="password"]:visible').first();
//   const loginButton = page.getByRole('button', { name: /^Login$/i });

//   await expect(usernameInput).toBeVisible({ timeout: 30_000 });
//   await usernameInput.fill(testData.login.username);

//   await expect(passwordInput).toBeVisible({ timeout: 30_000 });
//   await passwordInput.fill(testData.login.password);

//   await expect(loginButton).toBeVisible({ timeout: 30_000 });
//   await loginButton.click();

//   // Wait for Adora landing page after login
//   await expect(page).toHaveURL(/adora-v3-staging\.azurewebsites\.net\/global-landing-page/i, {
//     timeout: 90_000
//   });

//   // Use a stable page-level signal, not the Network Management card
//   await expect(
//     page.getByText('What would you like to do today?', { exact: true })
//   ).toBeVisible({ timeout: 90_000 });

//   await page.context().storageState({ path: 'playwright/.auth/user.json' });
// });





const { test, expect } = require('@playwright/test');
const testData = require('../fixtures/testData.json');

test('authenticate', async ({ page }) => {
  await page.goto(testData.login.urlPath, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000
  });

  const stayLoggedInButton = page.getByRole('button', { name: /stay logged in/i });

  if (await stayLoggedInButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await stayLoggedInButton.click();
  }

  const landingPageTitle = page.getByText('What would you like to do today?', {
    exact: true
  });

  if (await landingPageTitle.isVisible({ timeout: 5000 }).catch(() => false)) {
    await page.context().storageState({ path: 'playwright/.auth/user.json' });
    return;
  }

  const usernameInput = page.locator('input[placeholder="Email Address"]:visible').first();
  const passwordInput = page.locator('input[type="password"]:visible').first();
  const loginButton = page.getByRole('button', { name: /^Login$/i });

  await expect(usernameInput).toBeVisible({ timeout: 30_000 });
  await usernameInput.fill(testData.login.username);

  await expect(passwordInput).toBeVisible({ timeout: 30_000 });
  await passwordInput.fill(testData.login.password);

  await expect(loginButton).toBeVisible({ timeout: 30_000 });
  await loginButton.click();

  await expect(page).toHaveURL(/global-landing-page/i, {
    timeout: 90_000
  });

  await expect(landingPageTitle).toBeVisible({ timeout: 90_000 });

  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});