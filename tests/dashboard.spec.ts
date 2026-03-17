// import { test } from '@playwright/test';
// import testData from '../fixtures/testData.json';
// import { LoginPage } from '../pages/LoginPage';
// import { LandingPage } from '../pages/LandingPage';
// import { DashboardPage } from '../pages/DashboardPage';

// test('Dashboard: Network Management tile routes to dashboard', async ({ page }) => {
//   const login = new LoginPage(page);
//   const landing = new LandingPage(page);
//   const dashboard = new DashboardPage(page);

//   await test.step('Login', async () => {
//     await login.open(testData.login.urlPath);
//     await login.login(testData.login.username, testData.login.password);
//   });

//   await test.step('Open Network Management', async () => {
//     await landing.assertLoaded();
//     await landing.openNetworkManagement();
//   });

//   await test.step('Verify dashboard loaded', async () => {
//     await dashboard.assertLoaded();
//   });
// });

import { test } from '@playwright/test';
import testData from '../fixtures/testData.json';
import { LoginPage } from '../pages/LoginPage';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';

test('Dashboard: Network Management tile routes to dashboard', async ({ page }) => {
  const login = new LoginPage(page);
  const landing = new LandingPage(page);
  const dashboard = new DashboardPage(page);

  await test.step('Login', async () => {
    await login.open(testData.login.urlPath);
    await login.login(testData.login.username, testData.login.password);
  });

  await test.step('Open Network Management', async () => {
    await landing.assertLoaded();
    await landing.openNetworkManagement();
  });

  await test.step('Verify dashboard loaded', async () => {
    await dashboard.assertLoaded();
  });
});
