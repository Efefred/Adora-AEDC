// // const { expect, test } = require('@playwright/test');
// // const testData = require('../fixtures/testData.json');

// // const { LandingPage } = require('../pages/LandingPage');
// // const { DashboardPage } = require('../pages/DashboardPage');
// // const { GridEnergyProfilePage } = require('../pages/GridEnergyProfilePage');
// // const { BandTariffsPage } = require('../pages/BandTariffsPage');
// // const { NodeEnergyAnalysisHelper } = require('../utils/nodeEnergyAnalysisHelper');
// // const { generateCustomHtmlReport } = require('../utils/customHtmlReporter');

// // const tariffRateCache = {};

// // function format3(value) {
// //   return value !== null && value !== undefined ? Number(value).toFixed(3) : null;
// // }

// // async function getTariffRateCached(bandTariffsPage, bandName) {
// //   if (!tariffRateCache[bandName]) {
// //     await bandTariffsPage.openBandTariffs();
// //     tariffRateCache[bandName] = await bandTariffsPage.getTariffRateForBand(bandName);
// //   }
// //   return tariffRateCache[bandName];
// // }

// // const nodeEnergyCases = [
// //   {
// //     title: 'Distribution Transformer',
// //     numberLabel: 'DT Number',
// //     searchValue: testData.nodeEnergyAnalysis.dtNumber,
// //     openTab: async (page) => page.openDistributionTransformerTab(),
// //     search: async (page, value) => page.searchByDtNumber(value),
// //     supportsTariffValidation: true,
// //     supportsConnectedCustomers: true,
// //     supportsRetailedEnergyValidation: true
// //   },
// //   {
// //     title: 'Outgoing 33KV Feeders',
// //     numberLabel: 'Feeder 33 No',
// //     searchValue: testData.nodeEnergyAnalysis.f33Number,
// //     openTab: async (page) => page.openOutgoing33KvFeedersTab(),
// //     search: async (page, value) => page.searchByFeeder33Number(value),
// //     supportsTariffValidation: false,
// //     supportsConnectedCustomers: false,
// //     supportsRetailedEnergyValidation: false
// //   },
// //   {
// //     title: 'Outgoing 11KV Feeders',
// //     numberLabel: 'Feeder 11 No',
// //     searchValue: testData.nodeEnergyAnalysis.f11Number,
// //     openTab: async (page) => page.openOutgoing11KvFeedersTab(),
// //     search: async (page, value) => page.searchByFeeder11Number(value),
// //     supportsTariffValidation: false,
// //     supportsConnectedCustomers: false,
// //     supportsRetailedEnergyValidation: false
// //   }
// // ];

// // test.describe('Node Energy Analysis', () => {
// //   test.setTimeout(180_000);

// //   nodeEnergyCases.forEach(({
// //     title,
// //     numberLabel,
// //     searchValue,
// //     openTab,
// //     search,
// //     supportsTariffValidation,
// //     supportsConnectedCustomers,
// //     supportsRetailedEnergyValidation
// //   }) => {

// //     test(`should dynamically read and output A-F values for ${title}`, async ({ page }) => {

// //       const landingPage = new LandingPage(page);
// //       const dashboardPage = new DashboardPage(page);
// //       const gridEnergyProfilePage = new GridEnergyProfilePage(page);
// //       const bandTariffsPage = new BandTariffsPage(page);

// //       await test.step('Navigate to Node Energy Analysis page', async () => {
// //         await page.goto('/global-landing-page', {
// //           waitUntil: 'commit',
// //           timeout: 90_000
// //         });

// //         await expect(
// //           page.getByText('What would you like to do today?', { exact: true })
// //         ).toBeVisible({ timeout: 90_000 });

// //         await landingPage.openNetworkManagement();
// //         await dashboardPage.goToNodeEnergyAnalysis();
// //         await gridEnergyProfilePage.assertLoaded();
// //       });

// //       await test.step(`Open ${title} tab`, async () => {
// //         await openTab(gridEnergyProfilePage);
// //       });

// //       await test.step(`Search by ${numberLabel}`, async () => {
// //         await search(gridEnergyProfilePage, searchValue);
// //       });

// //       await test.step('Read and compute values', async () => {

// //         const larRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'LAR (MWH)');
// //         const parRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'PAR (MWH)');
// //         const mfRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'MF');

// //         const retailedRaw = supportsRetailedEnergyValidation
// //           ? await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'RETAILED ENERGY').catch(() => null)
// //           : null;

// //         const lossesRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'LOSSES (MWH)').catch(() => null);
// //         const lossPctRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'LOSSES (%)').catch(() => null);

// //         const lar = NodeEnergyAnalysisHelper.parseReading(larRaw).value;
// //         const par = NodeEnergyAnalysisHelper.parseReading(parRaw).value;
// //         const mf = NodeEnergyAnalysisHelper.parseReading(mfRaw).value;

// //         // // DEFAULT: Dynamically read MF from row
// //         // // const mf = NodeEnergyAnalysisHelper.parseReading(mfRaw).value;

// //         // // DEMO ONLY: Hardcoded MF to prove validation failure

// //         //    const mf = 3;

// //         const deltaResult = NodeEnergyAnalysisHelper.computeDelta(par, lar);
// //         const energyReceivedResult = NodeEnergyAnalysisHelper.computeEnergyReceived(deltaResult.delta, mf);

// //         const retailed = retailedRaw ? NodeEnergyAnalysisHelper.parseReading(retailedRaw).value : null;

// //         let losses = null;
// //         let lossPct = null;

// //         if (supportsRetailedEnergyValidation && retailed !== null) {
// //           const lossRes = NodeEnergyAnalysisHelper.computeLosses(
// //             energyReceivedResult.energyReceived,
// //             retailed
// //           );

// //           if (lossRes.isComputable) {
// //             losses = lossRes.losses;

// //             const pctRes = NodeEnergyAnalysisHelper.computeLossPercentage(
// //               losses,
// //               energyReceivedResult.energyReceived
// //             );

// //             if (pctRes.isComputable) {
// //               lossPct = pctRes.percentage;
// //             }
// //           }
// //         } else {
// //           losses = lossesRaw ? NodeEnergyAnalysisHelper.parseReading(lossesRaw).value : null;
// //           lossPct = lossPctRaw ? NodeEnergyAnalysisHelper.parseReading(lossPctRaw).value : null;
// //         }

// //         console.log('\n[NODE ENERGY ANALYSIS RESULT]');
// //         console.log(title);
// //         console.log(`${numberLabel.padEnd(24)} : ${searchValue}`);
// //         console.log(`LAR`.padEnd(24) + `: ${lar}`);
// //         console.log(`PAR`.padEnd(24) + `: ${par}`);
// //         console.log(`Energy Delta`.padEnd(24) + `: ${format3(deltaResult.delta)}`);
// //         console.log(`MF`.padEnd(24) + `: ${mf}`);
// //         console.log(`Energy Received`.padEnd(24) + `: ${format3(energyReceivedResult.energyReceived)}`);
// //         console.log(`Retailed Energy`.padEnd(24) + `: ${format3(retailed)}`);
// //         console.log(`Losses`.padEnd(24) + `: ${format3(losses)}`);
// //         console.log(`Loss %`.padEnd(24) + `: ${format3(lossPct)}`);

// //         if (supportsTariffValidation) {
// //           const band = await gridEnergyProfilePage.getActiveBand();
// //           const tariff = await getTariffRateCached(bandTariffsPage, band);

// //           const revenue = NodeEnergyAnalysisHelper.computeExpectedRevenue(
// //             energyReceivedResult.energyReceived,
// //             tariff
// //           );

// //           console.log(`Active Band`.padEnd(24) + `: ${band}`);
// //           console.log(`Tariff Rate`.padEnd(24) + `: ${tariff}`);
// //           console.log(`Expected Revenue`.padEnd(24) + `: ${format3(revenue.revenue)}`);
// //         }
// //       });
// //     });
// //   });
// // });




// const { expect, test } = require('@playwright/test');
// const testData = require('../fixtures/testData.json');

// const { LandingPage } = require('../pages/LandingPage');
// const { DashboardPage } = require('../pages/DashboardPage');
// const { GridEnergyProfilePage } = require('../pages/GridEnergyProfilePage');
// const { BandTariffsPage } = require('../pages/BandTariffsPage');
// const { NodeEnergyAnalysisHelper } = require('../utils/nodeEnergyAnalysisHelper');
// const { generateCustomHtmlReport } = require('../utils/customHtmlReporter');

// const tariffRateCache = {};

// function format3(value) {
//   return value !== null && value !== undefined ? Number(value).toFixed(3) : null;
// }

// function safeFileName(value) {
//   return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// }

// async function getTariffRateCached(bandTariffsPage, bandName) {
//   if (!tariffRateCache[bandName]) {
//     await bandTariffsPage.openBandTariffs();
//     tariffRateCache[bandName] = await bandTariffsPage.getTariffRateForBand(bandName);
//   }
//   return tariffRateCache[bandName];
// }

// const nodeEnergyCases = [
//   {
//     title: 'Distribution Transformer',
//     numberLabel: 'DT Number',
//     searchValue: testData.nodeEnergyAnalysis.dtNumber,
//     openTab: async (page) => page.openDistributionTransformerTab(),
//     search: async (page, value) => page.searchByDtNumber(value),
//     supportsTariffValidation: true,
//     supportsConnectedCustomers: true,
//     supportsRetailedEnergyValidation: true
//   },
//   {
//     title: 'Outgoing 33KV Feeders',
//     numberLabel: 'Feeder 33 No',
//     searchValue: testData.nodeEnergyAnalysis.f33Number,
//     openTab: async (page) => page.openOutgoing33KvFeedersTab(),
//     search: async (page, value) => page.searchByFeeder33Number(value),
//     supportsTariffValidation: false,
//     supportsConnectedCustomers: false,
//     supportsRetailedEnergyValidation: false
//   },
//   {
//     title: 'Outgoing 11KV Feeders',
//     numberLabel: 'Feeder 11 No',
//     searchValue: testData.nodeEnergyAnalysis.f11Number,
//     openTab: async (page) => page.openOutgoing11KvFeedersTab(),
//     search: async (page, value) => page.searchByFeeder11Number(value),
//     supportsTariffValidation: false,
//     supportsConnectedCustomers: false,
//     supportsRetailedEnergyValidation: false
//   }
// ];

// test.describe('Node Energy Analysis', () => {
//   test.setTimeout(180_000);

//   nodeEnergyCases.forEach(({
//     title,
//     numberLabel,
//     searchValue,
//     openTab,
//     search,
//     supportsTariffValidation,
//     supportsConnectedCustomers,
//     supportsRetailedEnergyValidation
//   }) => {

//     test(`should dynamically read and output A-F values for ${title}`, async ({ page }) => {
//       const landingPage = new LandingPage(page);
//       const dashboardPage = new DashboardPage(page);
//       const gridEnergyProfilePage = new GridEnergyProfilePage(page);
//       const bandTariffsPage = new BandTariffsPage(page);

//       await test.step('Navigate to Node Energy Analysis page', async () => {
//         await page.goto('/global-landing-page', {
//           waitUntil: 'commit',
//           timeout: 90_000
//         });

//         await expect(
//           page.getByText('What would you like to do today?', { exact: true })
//         ).toBeVisible({ timeout: 90_000 });

//         await landingPage.openNetworkManagement();
//         await dashboardPage.goToNodeEnergyAnalysis();
//         await gridEnergyProfilePage.assertLoaded();
//       });

//       await test.step(`Open ${title} tab`, async () => {
//         await openTab(gridEnergyProfilePage);
//       });

//       await test.step(`Search by ${numberLabel}`, async () => {
//         await search(gridEnergyProfilePage, searchValue);
//       });

//       await test.step('Read, compute and generate custom dashboard report', async () => {
//         const larRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'LAR (MWH)');
//         const parRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'PAR (MWH)');
//         const mfRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'MF');

//         const retailedRaw = supportsRetailedEnergyValidation
//           ? await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'RETAILED ENERGY').catch(() => null)
//           : null;

//         const lossesRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'LOSSES (MWH)').catch(() => null);
//         const lossPctRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'LOSSES (%)').catch(() => null);

//         const lar = NodeEnergyAnalysisHelper.parseReading(larRaw).value;
//         const par = NodeEnergyAnalysisHelper.parseReading(parRaw).value;
//         const mf = NodeEnergyAnalysisHelper.parseReading(mfRaw).value;

//         const deltaResult = NodeEnergyAnalysisHelper.computeDelta(par, lar);
//         const energyReceivedResult = NodeEnergyAnalysisHelper.computeEnergyReceived(deltaResult.delta, mf);

//         const retailed = retailedRaw ? NodeEnergyAnalysisHelper.parseReading(retailedRaw).value : null;

//         let losses = null;
//         let lossPct = null;

//         if (supportsRetailedEnergyValidation && retailed !== null) {
//           const lossRes = NodeEnergyAnalysisHelper.computeLosses(
//             energyReceivedResult.energyReceived,
//             retailed
//           );

//           if (lossRes.isComputable) {
//             losses = lossRes.losses;

//             const pctRes = NodeEnergyAnalysisHelper.computeLossPercentage(
//               losses,
//               energyReceivedResult.energyReceived
//             );

//             if (pctRes.isComputable) {
//               lossPct = pctRes.percentage;
//             }
//           }
//         } else {
//           losses = lossesRaw ? NodeEnergyAnalysisHelper.parseReading(lossesRaw).value : null;
//           lossPct = lossPctRaw ? NodeEnergyAnalysisHelper.parseReading(lossPctRaw).value : null;
//         }

//         let band = null;
//         let tariff = null;
//         let expectedRevenue = null;

//         if (supportsTariffValidation) {
//           band = await gridEnergyProfilePage.getActiveBand();
//           tariff = await getTariffRateCached(bandTariffsPage, band);

//           const revenue = NodeEnergyAnalysisHelper.computeExpectedRevenue(
//             energyReceivedResult.energyReceived,
//             tariff
//           );

//           expectedRevenue = revenue.revenue;
//         }

//         console.log('\n[NODE ENERGY ANALYSIS RESULT]');
//         console.log(title);
//         console.log(`${numberLabel.padEnd(24)} : ${searchValue}`);
//         console.log(`LAR`.padEnd(24) + `: ${lar}`);
//         console.log(`PAR`.padEnd(24) + `: ${par}`);
//         console.log(`Energy Delta`.padEnd(24) + `: ${format3(deltaResult.delta)}`);
//         console.log(`MF`.padEnd(24) + `: ${mf}`);
//         console.log(`Energy Received`.padEnd(24) + `: ${format3(energyReceivedResult.energyReceived)}`);
//         console.log(`Retailed Energy`.padEnd(24) + `: ${format3(retailed)}`);
//         console.log(`Losses`.padEnd(24) + `: ${format3(losses)}`);
//         console.log(`Loss %`.padEnd(24) + `: ${format3(lossPct)}`);

//         if (supportsTariffValidation) {
//           console.log(`Active Band`.padEnd(24) + `: ${band}`);
//           console.log(`Tariff Rate`.padEnd(24) + `: ${tariff}`);
//           console.log(`Expected Revenue`.padEnd(24) + `: ${format3(expectedRevenue)}`);
//         }

//         await generateCustomHtmlReport({
//           title: `Node Energy Analysis - ${title} Report`,
//           fileName: `node-energy-analysis-${safeFileName(title)}-report.html`,
//           sections: [
//             {
//               title: `${title} Calculation Summary`,
//               cards: [
//                 {
//                   title,
//                   metrics: {
//                     [numberLabel]: searchValue,
//                     'LAR (MWH)': format3(lar),
//                     'PAR (MWH)': format3(par),
//                     'Energy Delta': format3(deltaResult.delta),
//                     MF: mf,
//                     'Energy Received': format3(energyReceivedResult.energyReceived),
//                     'Retailed Energy': format3(retailed),
//                     Losses: format3(losses),
//                     'Loss %': format3(lossPct),
//                     ...(supportsTariffValidation
//                       ? {
//                           'Active Band': band,
//                           'Tariff Rate': tariff,
//                           'Expected Revenue': format3(expectedRevenue)
//                         }
//                       : {})
//                   }
//                 }
//               ]
//             }
//           ]
//         });
//       });
//     });
//   });
// });




const { expect, test } = require('@playwright/test');
const testData = require('../fixtures/testData.json');

const { LandingPage } = require('../pages/LandingPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { GridEnergyProfilePage } = require('../pages/GridEnergyProfilePage');
const { BandTariffsPage } = require('../pages/BandTariffsPage');
const { NodeEnergyAnalysisHelper } = require('../utils/nodeEnergyAnalysisHelper');
const { generateCustomHtmlReport } = require('../utils/customHtmlReporter');

const tariffRateCache = {};
const nodeEnergyReportCards = [];

function format3(value) {
  return value !== null && value !== undefined ? Number(value).toFixed(3) : null;
}

async function getTariffRateCached(bandTariffsPage, bandName) {
  if (!tariffRateCache[bandName]) {
    await bandTariffsPage.openBandTariffs();
    tariffRateCache[bandName] = await bandTariffsPage.getTariffRateForBand(bandName);
  }
  return tariffRateCache[bandName];
}

const nodeEnergyCases = [
  {
    title: 'Distribution Transformer',
    numberLabel: 'DT Number',
    searchValue: testData.nodeEnergyAnalysis.dtNumber,
    openTab: async (page) => page.openDistributionTransformerTab(),
    search: async (page, value) => page.searchByDtNumber(value),
    supportsTariffValidation: true,
    supportsConnectedCustomers: true,
    supportsRetailedEnergyValidation: true
  },
  {
    title: 'Outgoing 33KV Feeders',
    numberLabel: 'Feeder 33 No',
    searchValue: testData.nodeEnergyAnalysis.f33Number,
    openTab: async (page) => page.openOutgoing33KvFeedersTab(),
    search: async (page, value) => page.searchByFeeder33Number(value),
    supportsTariffValidation: false,
    supportsConnectedCustomers: false,
    supportsRetailedEnergyValidation: false
  },
  {
    title: 'Outgoing 11KV Feeders',
    numberLabel: 'Feeder 11 No',
    searchValue: testData.nodeEnergyAnalysis.f11Number,
    openTab: async (page) => page.openOutgoing11KvFeedersTab(),
    search: async (page, value) => page.searchByFeeder11Number(value),
    supportsTariffValidation: false,
    supportsConnectedCustomers: false,
    supportsRetailedEnergyValidation: false
  }
];

test.describe('Node Energy Analysis', () => {
  test.setTimeout(180_000);

  test.afterAll(async () => {
    await generateCustomHtmlReport({
      title: 'Node Energy Analysis Report',
      fileName: 'node-energy-analysis-report.html',
      sections: [
        {
          title: 'Node Energy Analysis Calculation Summary',
          cards: nodeEnergyReportCards
        }
      ]
    });
  });

  nodeEnergyCases.forEach(({
    title,
    numberLabel,
    searchValue,
    openTab,
    search,
    supportsTariffValidation,
    supportsConnectedCustomers,
    supportsRetailedEnergyValidation
  }) => {

    test(`should dynamically read and output A-F values for ${title}`, async ({ page }) => {
      const landingPage = new LandingPage(page);
      const dashboardPage = new DashboardPage(page);
      const gridEnergyProfilePage = new GridEnergyProfilePage(page);
      const bandTariffsPage = new BandTariffsPage(page);

      await test.step('Navigate to Node Energy Analysis page', async () => {
        await page.goto('/global-landing-page', {
          waitUntil: 'commit',
          timeout: 90_000
        });

        await expect(
          page.getByText('What would you like to do today?', { exact: true })
        ).toBeVisible({ timeout: 90_000 });

        await landingPage.openNetworkManagement();
        await dashboardPage.goToNodeEnergyAnalysis();
        await gridEnergyProfilePage.assertLoaded();
      });

      await test.step(`Open ${title} tab`, async () => {
        await openTab(gridEnergyProfilePage);
      });

      await test.step(`Search by ${numberLabel}`, async () => {
        await search(gridEnergyProfilePage, searchValue);
      });

      await test.step('Read and compute values', async () => {
        const larRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'LAR (MWH)');
        const parRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'PAR (MWH)');
        const mfRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'MF');

        const retailedRaw = supportsRetailedEnergyValidation
          ? await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'RETAILED ENERGY').catch(() => null)
          : null;

        const lossesRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'LOSSES (MWH)').catch(() => null);
        const lossPctRaw = await gridEnergyProfilePage.getCellTextByHeader(searchValue, 'LOSSES (%)').catch(() => null);

        const lar = NodeEnergyAnalysisHelper.parseReading(larRaw).value;
        const par = NodeEnergyAnalysisHelper.parseReading(parRaw).value;
        const mf = NodeEnergyAnalysisHelper.parseReading(mfRaw).value;

        const deltaResult = NodeEnergyAnalysisHelper.computeDelta(par, lar);
        const energyReceivedResult = NodeEnergyAnalysisHelper.computeEnergyReceived(deltaResult.delta, mf);

        const retailed = retailedRaw ? NodeEnergyAnalysisHelper.parseReading(retailedRaw).value : null;

        let losses = null;
        let lossPct = null;

        if (supportsRetailedEnergyValidation && retailed !== null) {
          const lossRes = NodeEnergyAnalysisHelper.computeLosses(
            energyReceivedResult.energyReceived,
            retailed
          );

          if (lossRes.isComputable) {
            losses = lossRes.losses;

            const pctRes = NodeEnergyAnalysisHelper.computeLossPercentage(
              losses,
              energyReceivedResult.energyReceived
            );

            if (pctRes.isComputable) {
              lossPct = pctRes.percentage;
            }
          }
        } else {
          losses = lossesRaw ? NodeEnergyAnalysisHelper.parseReading(lossesRaw).value : null;
          lossPct = lossPctRaw ? NodeEnergyAnalysisHelper.parseReading(lossPctRaw).value : null;
        }

        let band = null;
        let tariff = null;
        let expectedRevenue = null;

        if (supportsTariffValidation) {
          band = await gridEnergyProfilePage.getActiveBand();
          tariff = await getTariffRateCached(bandTariffsPage, band);

          const revenue = NodeEnergyAnalysisHelper.computeExpectedRevenue(
            energyReceivedResult.energyReceived,
            tariff
          );

          expectedRevenue = revenue.revenue;
        }

        console.log('\n[NODE ENERGY ANALYSIS RESULT]');
        console.log(title);
        console.log(`${numberLabel.padEnd(24)} : ${searchValue}`);
        console.log(`LAR`.padEnd(24) + `: ${lar}`);
        console.log(`PAR`.padEnd(24) + `: ${par}`);
        console.log(`Energy Delta`.padEnd(24) + `: ${format3(deltaResult.delta)}`);
        console.log(`MF`.padEnd(24) + `: ${mf}`);
        console.log(`Energy Received`.padEnd(24) + `: ${format3(energyReceivedResult.energyReceived)}`);
        console.log(`Retailed Energy`.padEnd(24) + `: ${format3(retailed)}`);
        console.log(`Losses`.padEnd(24) + `: ${format3(losses)}`);
        console.log(`Loss %`.padEnd(24) + `: ${format3(lossPct)}`);

        if (supportsTariffValidation) {
          console.log(`Active Band`.padEnd(24) + `: ${band}`);
          console.log(`Tariff Rate`.padEnd(24) + `: ${tariff}`);
          console.log(`Expected Revenue`.padEnd(24) + `: ${format3(expectedRevenue)}`);
        }

        nodeEnergyReportCards.push({
          title,
          metrics: {
            [numberLabel]: searchValue,
            'LAR (MWH)': format3(lar),
            'PAR (MWH)': format3(par),
            'Energy Delta': format3(deltaResult.delta),
            MF: mf,
            'Energy Received': format3(energyReceivedResult.energyReceived),
            'Retailed Energy': format3(retailed),
            Losses: format3(losses),
            'Loss %': format3(lossPct),
            ...(supportsTariffValidation
              ? {
                  'Active Band': band,
                  'Tariff Rate': tariff,
                  'Expected Revenue': format3(expectedRevenue)
                }
              : {})
          }
        });
      });
    });
  });
});