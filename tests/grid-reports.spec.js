const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const testData = require('../fixtures/testData.json');
const { LoginPage } = require('../pages/LoginPage');
const { LandingPage } = require('../pages/LandingPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { GridEnergyProfilePage } = require('../pages/GridEnergyProfilePage');

const downloadCases = [
  {
    title: 'Distribution Transformer',
    openTab: async (gridEnergyProfilePage) => {
      await gridEnergyProfilePage.openDistributionTransformerTab();
    }
  },
  {
    title: 'Outgoing 33KV Feeders',
    openTab: async (gridEnergyProfilePage) => {
      await gridEnergyProfilePage.openOutgoing33KvFeedersTab();
    }
  },
  {
    title: 'Outgoing 11KV Feeders',
    openTab: async (gridEnergyProfilePage) => {
      await gridEnergyProfilePage.openOutgoing11KvFeedersTab();
    }
  }
];

test.describe('Grid Reports Download', () => {
  test.setTimeout(180_000);

  test('should download Excel report successfully for Distribution Transformer, Outgoing 33KV Feeders and Outgoing 11KV Feeders', async ({
    page
  }) => {
    const loginPage = new LoginPage(page);
    const landingPage = new LandingPage(page);
    const dashboardPage = new DashboardPage(page);
    const gridEnergyProfilePage = new GridEnergyProfilePage(page);

    await test.step('Login into application', async () => {
      await loginPage.open(testData.login.urlPath);
      await loginPage.login(testData.login.username, testData.login.password);
    });

    await test.step('Navigate to Grid Energy Profile page', async () => {
      await landingPage.assertLoaded();
      await landingPage.openNetworkManagement();
      await dashboardPage.assertLoaded();
      await dashboardPage.goToNodeEnergyAnalysis();
      await gridEnergyProfilePage.assertLoaded();
    });

    for (const scenario of downloadCases) {
      await test.step(`Download and verify Excel report for ${scenario.title}`, async () => {
        await scenario.openTab(gridEnergyProfilePage);

        const download = await gridEnergyProfilePage.downloadReport();

        const contentType =
          download.headers['content-type'] ||
          download.headers['Content-Type'] ||
          '';

        expect(contentType.toLowerCase()).toContain(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        expect(download.buffer.length).toBeGreaterThan(0);

        const downloadDir = path.join(process.cwd(), 'test-results', 'downloads');
        fs.mkdirSync(downloadDir, { recursive: true });

        const safeTitle = scenario.title.replace(/[^\w.-]+/g, '_');
        const filePath = path.join(downloadDir, `${safeTitle}_${Date.now()}.xlsx`);

        fs.writeFileSync(filePath, download.buffer);

        expect(fs.existsSync(filePath)).toBeTruthy();

        const stats = fs.statSync(filePath);
        expect(stats.size).toBeGreaterThan(0);

        console.log(`[DOWNLOAD VERIFIED - API MODE] ${scenario.title}`);
        console.log(`Response URL     : ${download.url}`);
        console.log(`Content-Type     : ${contentType}`);
        console.log(`Saved file path  : ${filePath}`);
        console.log(`File size(bytes) : ${stats.size}`);
      });
    }
  });
});