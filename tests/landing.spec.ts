// import { test } from '@playwright/test';
// import testData from '../fixtures/testData.json';
// import { LoginPage } from '../pages/LoginPage';
// import { LandingPage } from '../pages/LandingPage';

// test('Landing page: loads and shows Network Management tile', async ({ page }) => {
//   const login = new LoginPage(page);
//   const landing = new LandingPage(page);

//   await test.step('Login', async () => {
//     await login.open(testData.login.urlPath);
//     await login.login(testData.login.username, testData.login.password);
//   });

//   await test.step('Verify landing page', async () => {
//     await landing.assertLoaded();
//   });
// });

import { test } from '@playwright/test';
import testData from '../fixtures/testData.json';
import { LoginPage } from '../pages/LoginPage';
import { LandingPage } from '../pages/LandingPage';

test('Landing page: loads and shows Network Management tile', async ({ page }) => {
  const login = new LoginPage(page);
  const landing = new LandingPage(page);

  await test.step('Login', async () => {
    await login.open(testData.login.urlPath);
    await login.login(testData.login.username, testData.login.password);
  });

  await test.step('Verify landing page', async () => {
    await landing.assertLoaded();
  });
});