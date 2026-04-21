const { test, expect } = require('@playwright/test');
const testData = require('../fixtures/testData.json');
const { LoginPage } = require('../pages/LoginPage');
const { LandingPage } = require('../pages/LandingPage');
const { OutageAvailabilityPage } = require('../pages/OutageAvailabilityPage');

const outageTabs = [
  'HQ/Regional Control Center',
  'Confirmed Outages',
  'Patrol Outages',
  'Suspended Outages',
  'Cancelled Outages',
  'Resolved Outages',
  'Archived Outages'
];

test.describe('Outage & Availability - Unplanned Outage Schedule Tabs', () => {
  test.setTimeout(180_000);

  test('should open Unplanned Outage Schedule and click all outage tabs', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const landingPage = new LandingPage(page);
    const outageAvailabilityPage = new OutageAvailabilityPage(page);

    await test.step('Login into application', async () => {
      await loginPage.open(testData.login.urlPath);
      await loginPage.login(testData.login.username, testData.login.password);
    });

    await test.step('Navigate to Network Management', async () => {
      await landingPage.assertLoaded();
      await landingPage.openNetworkManagement();
    });

    await test.step('Open Outage & Availability', async () => {
      await outageAvailabilityPage.openOutageAndAvailability();
    });

    await test.step('Open Unplanned Outage Schedule', async () => {
      await outageAvailabilityPage.openUnplannedOutageSchedule();
      await outageAvailabilityPage.assertLoaded();
    });

    for (const tabName of outageTabs) {
      await test.step(`Open ${tabName} tab`, async () => {
        await outageAvailabilityPage.openTab(tabName);
        await expect(outageAvailabilityPage.getTabByName(tabName)).toBeVisible({
          timeout: 90_000
        });
      });
    }
  });
});