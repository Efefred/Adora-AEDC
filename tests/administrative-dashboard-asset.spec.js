const { test, expect } = require('@playwright/test');
const testData = require('../fixtures/testData.json');
const { LoginPage } = require('../pages/LoginPage');
const { LandingPage } = require('../pages/LandingPage');
const { AdministrativeDashboardPage } = require('../pages/AdministrativeDashboardPage');

test.describe('Administrative Dashboard - Asset Communicating and Non-communicating Analysis', () => {
  test.setTimeout(180_000);

  test('should read communicating, non communicating and total values for 33KV Feeders, 11KV Feeders and Distribution Transformers', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const landingPage = new LandingPage(page);
    const administrativeDashboardPage = new AdministrativeDashboardPage(page);

    await test.step('Login into application', async () => {
      await loginPage.open(testData.login.urlPath);
      await loginPage.login(testData.login.username, testData.login.password);
    });

    await test.step('Navigate to Network Management', async () => {
      await landingPage.assertLoaded();
      await landingPage.openNetworkManagement();
    });

    await test.step('Open Administrative Dashboard', async () => {
      await administrativeDashboardPage.openAdministrativeDashboard();
      await administrativeDashboardPage.assertLoaded();
    });

    await test.step('Open Communication section', async () => {
      await administrativeDashboardPage.openCommunicationSection();
    });

    await test.step('Read asset communication metrics', async () => {
      const metrics = await administrativeDashboardPage.getAllAssetCommunicationMetrics();

      console.log(
        `33KV Feeders: Communicating: ${metrics.feeders33.communicating}, Non Communicating: ${metrics.feeders33.nonCommunicating}, Total: ${metrics.feeders33.total}`
      );
      console.log(
        `11KV Feeders: Communicating: ${metrics.feeders11.communicating}, Non Communicating: ${metrics.feeders11.nonCommunicating}, Total: ${metrics.feeders11.total}`
      );
      console.log(
        `Distribution Transformers: Communicating: ${metrics.distributionTransformers.communicating}, Non Communicating: ${metrics.distributionTransformers.nonCommunicating}, Total: ${metrics.distributionTransformers.total}`
      );

      expect(metrics.feeders33.total).toBe(
        metrics.feeders33.communicating + metrics.feeders33.nonCommunicating
      );
      expect(metrics.feeders11.total).toBe(
        metrics.feeders11.communicating + metrics.feeders11.nonCommunicating
      );
      expect(metrics.distributionTransformers.total).toBe(
        metrics.distributionTransformers.communicating +
          metrics.distributionTransformers.nonCommunicating
      );

      expect(metrics.feeders33.total).toBeGreaterThan(0);
      expect(metrics.feeders11.total).toBeGreaterThan(0);
      expect(metrics.distributionTransformers.total).toBeGreaterThan(0);
    });
  });
});