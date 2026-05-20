// const fs = require('fs');
// const { test, expect } = require('@playwright/test');

// const testData = require('../fixtures/testData.json');

// const { LoginPage } = require('../pages/LoginPage');
// const { LandingPage } = require('../pages/LandingPage');
// const { GridEnergyProfilePage } = require('../pages/GridEnergyProfilePage');

// const nodeEnergyDownloadCases = [
//   {
//     title: 'Outgoing 33KV Feeders',
//     open: async (gridPage) => {
//       await gridPage.openOutgoing33KvFeedersTab();
//     }
//   },
//   {
//     title: 'Outgoing 11KV Feeders',
//     open: async (gridPage) => {
//       await gridPage.openOutgoing11KvFeedersTab();
//     }
//   },
//   {
//     title: 'Distribution Transformer',
//     open: async (gridPage) => {
//       await gridPage.openDistributionTransformerTab();
//     }
//   }
// ];

// test.describe('Node Energy Analysis Downloads', () => {
//   test.setTimeout(240_000);

//   test('should download availability and report files for all node energy tabs', async ({ page }) => {

//     const loginPage = new LoginPage(page);
//     const landingPage = new LandingPage(page);
//     const gridPage = new GridEnergyProfilePage(page);

//     await test.step('Login into application', async () => {
//       await loginPage.open(testData.login.urlPath);
//       await loginPage.login(
//         testData.login.username,
//         testData.login.password
//       );
//     });

//     await test.step('Navigate to Network Management', async () => {
//       await landingPage.assertLoaded();
//       await landingPage.openNetworkManagement();
//     });

//     await test.step('Open Grid Energy Profile page', async () => {
//       await page.goto(
//         `${testData.login.baseUrl}/network-management/grid-energy-profile`,
//         {
//           waitUntil: 'domcontentloaded',
//           timeout: 120_000
//         }
//       );

//       await gridPage.assertLoaded();
//     });

//     for (const scenario of nodeEnergyDownloadCases) {

//       await test.step(`Open ${scenario.title} tab`, async () => {
//         await scenario.open(gridPage);
//       });

//       await test.step(`Download Availability for ${scenario.title}`, async () => {

//         const availabilityDownload =
//           await gridPage.downloadAvailabilityReport();

//         expect(availabilityDownload.fileName).toBeTruthy();

//         expect(
//           availabilityDownload.fileName.toLowerCase()
//         ).toMatch(/\.(xlsx|csv)$/);

//         expect(
//           fs.existsSync(availabilityDownload.filePath)
//         ).toBeTruthy();

//         const availabilityStats =
//           fs.statSync(availabilityDownload.filePath);

//         expect(availabilityStats.size).toBeGreaterThan(0);

//         console.log(`[AVAILABILITY DOWNLOAD VERIFIED] ${scenario.title}`);
//         console.log(`File name        : ${availabilityDownload.fileName}`);
//         console.log(`Saved file path  : ${availabilityDownload.filePath}`);
//         console.log(`File size(bytes) : ${availabilityStats.size}`);
//       });

//       await test.step(`Download Report for ${scenario.title}`, async () => {

//         const reportDownload =
//           await gridPage.downloadNodeEnergyReport();

//         expect(reportDownload.fileName).toBeTruthy();

//         expect(
//           reportDownload.fileName.toLowerCase()
//         ).toMatch(/\.(xlsx|csv)$/);

//         expect(
//           fs.existsSync(reportDownload.filePath)
//         ).toBeTruthy();

//         const reportStats =
//           fs.statSync(reportDownload.filePath);

//         expect(reportStats.size).toBeGreaterThan(0);

//         console.log(`[REPORT DOWNLOAD VERIFIED] ${scenario.title}`);
//         console.log(`File name        : ${reportDownload.fileName}`);
//         console.log(`Saved file path  : ${reportDownload.filePath}`);
//         console.log(`File size(bytes) : ${reportStats.size}`);
//       });
//     }
//   });
// });





const fs = require('fs');
const { test, expect } = require('@playwright/test');

const { LandingPage } = require('../pages/LandingPage');
const { GridEnergyProfilePage } = require('../pages/GridEnergyProfilePage');

const downloadScenarios = [
  {
    title: 'Outgoing 33KV Feeders',
    openTab: async (page) => {
      await page.openOutgoing33KvFeedersTab();
    }
  },
  {
    title: 'Outgoing 11KV Feeders',
    openTab: async (page) => {
      await page.openOutgoing11KvFeedersTab();
    }
  },
  {
    title: 'Distribution Transformer',
    openTab: async (page) => {
      await page.openDistributionTransformerTab();
    }
  }
];

test.describe('Node Energy Analysis Downloads', () => {
  test.setTimeout(300_000);

  test('should download availability and report files for all node energy tabs', async ({
    page
  }) => {
    const landingPage = new LandingPage(page);
    const gridPage = new GridEnergyProfilePage(page);

    await test.step('Open Network Management module', async () => {
      await page.goto(
        'https://adora-v3-staging.azurewebsites.net/network-management/grid-energy-profile',
        {
          waitUntil: 'domcontentloaded',
          timeout: 120_000
        }
      );

      await gridPage.assertLoaded();
    });

    for (const scenario of downloadScenarios) {
      await test.step(`Downloads for ${scenario.title}`, async () => {
        await scenario.openTab(gridPage);

        // DOWNLOAD AVAILABILITY
        const availabilityDownload =
          await gridPage.downloadAvailabilityReport();

        expect(availabilityDownload.fileName).toBeTruthy();

        expect(
          fs.existsSync(availabilityDownload.filePath)
        ).toBeTruthy();

        const availabilityStats = fs.statSync(
          availabilityDownload.filePath
        );

        expect(availabilityStats.size).toBeGreaterThan(0);

        console.log(
          `[AVAILABILITY DOWNLOAD VERIFIED] ${scenario.title}`
        );

        console.log(
          `Availability File: ${availabilityDownload.fileName}`
        );

        // DOWNLOAD REPORT
        const reportDownload =
          await gridPage.downloadNodeEnergyReport();

        expect(reportDownload.fileName).toBeTruthy();

        expect(
          fs.existsSync(reportDownload.filePath)
        ).toBeTruthy();

        const reportStats = fs.statSync(reportDownload.filePath);

        expect(reportStats.size).toBeGreaterThan(0);

        console.log(
          `[REPORT DOWNLOAD VERIFIED] ${scenario.title}`
        );

        console.log(`Report File: ${reportDownload.fileName}`);
      });
    }
  });
});