const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const testData = require('../fixtures/testData.json');
const { LoginPage } = require('../pages/LoginPage');
const { LandingPage } = require('../pages/LandingPage');
const { OutageAvailabilityPage } = require('../pages/OutageAvailabilityPage');

const outageReportCases = [
  {
    title: 'Unplanned Outage Schedule',
    open: async (outagePage) => {
      await outagePage.openUnplannedOutageSchedule();
      await outagePage.assertLoaded();
    }
  }
];

test.describe('Outage Reports Download', () => {
  test.setTimeout(180_000);

  test('should download Excel reports for outage module', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const landingPage = new LandingPage(page);
    const outagePage = new OutageAvailabilityPage(page);

    await test.step('Login into application', async () => {
      await loginPage.open(testData.login.urlPath);
      await loginPage.login(testData.login.username, testData.login.password);
    });

    await test.step('Navigate to Network Management', async () => {
      await landingPage.assertLoaded();
      await landingPage.openNetworkManagement();
    });

    await test.step('Open Outage & Availability', async () => {
      await outagePage.openOutageAndAvailability();
    });

    for (const scenario of outageReportCases) {
      await test.step(`Download report for ${scenario.title}`, async () => {
        await scenario.open(outagePage);

        const download = await outagePage.downloadUnplannedOutageReport();

        expect(download.fileName).toBeTruthy();
        expect(download.fileName.toLowerCase()).toContain('.xlsx');

        expect(fs.existsSync(download.filePath)).toBeTruthy();

        const stats = fs.statSync(download.filePath);
        expect(stats.size).toBeGreaterThan(0);

        console.log(`[DOWNLOAD VERIFIED] ${scenario.title}`);
        console.log(`File name        : ${download.fileName}`);
        console.log(`Saved file path  : ${download.filePath}`);
        console.log(`File size(bytes) : ${stats.size}`);
      });
    }
  });
});