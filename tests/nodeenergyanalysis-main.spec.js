const { expect, test } = require('@playwright/test');
const testData = require('../fixtures/testData.json');
const { LoginPage } = require('../pages/LoginPage');
const { LandingPage } = require('../pages/LandingPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { GridEnergyProfilePage } = require('../pages/GridEnergyProfilePage');
const { NodeEnergyAnalysisHelper } = require('../utils/nodeEnergyAnalysisHelper');

const nodeEnergyCases = [
  {
    title: 'Distribution Transformer',
    numberLabel: 'DT Number',
    searchValue: testData.nodeEnergyAnalysis.dtNumber,
    openTab: async (page) => page.openDistributionTransformerTab(),
    search: async (page, value) => page.searchByDtNumber(value),
    supportsCustomerConsumptionValidation: true
  },
  {
    title: 'Outgoing 33KV Feeders',
    numberLabel: 'Feeder 33 No',
    searchValue: testData.nodeEnergyAnalysis.f33Number,
    openTab: async (page) => page.openOutgoing33KvFeedersTab(),
    search: async (page, value) => page.searchByFeeder33Number(value),
    supportsCustomerConsumptionValidation: false
  },
  {
    title: 'Outgoing 11KV Feeders',
    numberLabel: 'Feeder 11 No',
    searchValue: testData.nodeEnergyAnalysis.f11Number,
    openTab: async (page) => page.openOutgoing11KvFeedersTab(),
    search: async (page, value) => page.searchByFeeder11Number(value),
    supportsCustomerConsumptionValidation: false
  },
];

test.describe('Node Energy Analysis', () => {
  test.setTimeout(180_000);

  nodeEnergyCases.forEach(({
    title,
    numberLabel,
    searchValue,
    openTab,
    search,
    supportsCustomerConsumptionValidation
  }) => {
    test(`should dynamically read LAR and PAR for ${title} and compute Energy Delta`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const landingPage = new LandingPage(page);
      const dashboardPage = new DashboardPage(page);
      const gridEnergyProfilePage = new GridEnergyProfilePage(page);

      await test.step('Login into application', async () => {
        await loginPage.open(testData.login.urlPath);
        await loginPage.login(testData.login.username, testData.login.password);
      });

      await test.step('Navigate to Node Energy Analysis page', async () => {
        await landingPage.assertLoaded();
        await landingPage.openNetworkManagement();
        await dashboardPage.assertLoaded();
        await dashboardPage.goToNodeEnergyAnalysis();
        await gridEnergyProfilePage.assertLoaded();
      });

      await test.step(`Open ${title} tab`, async () => {
        await openTab(gridEnergyProfilePage);
      });

      await test.step(`Search by ${numberLabel}`, async () => {
        await search(gridEnergyProfilePage, searchValue);
      });

      await test.step('Read displayed LAR and PAR values dynamically from the searched row and compute Energy Delta', async () => {
        const readings = await gridEnergyProfilePage.getLarAndParParsedValues(searchValue);
        const result = NodeEnergyAnalysisHelper.computeDelta(readings.par, readings.lar);

        console.log('[NODE ENERGY ANALYSIS RESULT]');
        console.log(`${numberLabel} : ${searchValue}`);
        console.log(`LAR (raw)     : ${readings.larRaw}`);
        console.log(`PAR (raw)     : ${readings.parRaw}`);
        console.log(`LAR (parsed)  : ${readings.lar}`);
        console.log(`PAR (parsed)  : ${readings.par}`);

        if (!result.isComputable) {
          console.log(`Energy Delta  : Not computable (${result.reason})`);
          expect(result.delta).toBeNull();
          return;
        }

        console.log(`Energy Delta  : ${result.delta?.toFixed(3)}`);

        expect(result.delta).toBeCloseTo(readings.par - readings.lar, 6);

        if (readings.par > readings.lar) {
          expect(result.delta).toBeGreaterThan(0);
        } else if (readings.par === readings.lar) {
          expect(result.delta).toBe(0);
        } else {
          expect(result.delta).toBeLessThan(0);
          expect(result.isNegative).toBeTruthy();
        }

        if (!supportsCustomerConsumptionValidation) {
          return;
        }

        await test.step('Open DT modal, sum all customer Consumption values in MWh, and validate Retailed Energy + Losses', async () => {
          await gridEnergyProfilePage.openDetailsModalFromResultRow(searchValue);
          await gridEnergyProfilePage.openCustomersTabInModal();

          const totalCustomerConsumptionMwh =
            await gridEnergyProfilePage.getTotalCustomerConsumptionMwhFromModal();

          const retailedEnergyMwh =
            NodeEnergyAnalysisHelper.computeRetailedEnergy(totalCustomerConsumptionMwh);

          const lossesResult =
            NodeEnergyAnalysisHelper.computeLosses(result.delta, retailedEnergyMwh);

          console.log(`Customer Consumption Total (MWh): ${totalCustomerConsumptionMwh.toFixed(6)}`);
          console.log(`Retailed Energy (MWh)          : ${retailedEnergyMwh.toFixed(3)}`);

          if (!lossesResult.isComputable) {
            console.log(`Losses (MWh)                   : Not computable (${lossesResult.reason})`);
            expect(lossesResult.losses).toBeNull();
            return;
          }

          console.log(`Losses (MWh)                   : ${lossesResult.losses.toFixed(3)}`);

          expect(
            NodeEnergyAnalysisHelper.compareWithTolerance(
              retailedEnergyMwh,
              totalCustomerConsumptionMwh,
              0.001
            )
          ).toBeTruthy();

          expect(
            NodeEnergyAnalysisHelper.compareWithTolerance(
              lossesResult.losses,
              result.delta - retailedEnergyMwh,
              0.001
            )
          ).toBeTruthy();
        });
      });
    });
  });
});