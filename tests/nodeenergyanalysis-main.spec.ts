import { expect, test } from '@playwright/test';
import testData from '../fixtures/testData.json';
import { LoginPage } from '../pages/LoginPage';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { GridEnergyProfilePage } from '../pages/GridEnergyProfilePage';
import { NodeEnergyAnalysisHelper } from '../utils/nodeEnergyAnalysisHelper';

type NodeEnergyCase = {
  title: string;
  numberLabel: string;
  searchValue: string;
  openTab: (page: GridEnergyProfilePage) => Promise<void>;
  search: (page: GridEnergyProfilePage, value: string) => Promise<void>;
};

const nodeEnergyCases: NodeEnergyCase[] = [
  {
    title: 'Distribution Transformer',
    numberLabel: 'DT Number',
    searchValue: testData.nodeEnergyAnalysis.dtNumber,
    openTab: async (page) => page.openDistributionTransformerTab(),
    search: async (page, value) => page.searchByDtNumber(value),
  },
  {
    title: 'Outgoing 33KV Feeders',
    numberLabel: 'Feeder 33 No',
    searchValue: testData.nodeEnergyAnalysis.f33Number,
    openTab: async (page) => page.openOutgoing33KvFeedersTab(),
    search: async (page, value) => page.searchByFeeder33Number(value),
  },
  {
    title: 'Outgoing 11KV Feeders',
    numberLabel: 'Feeder 11 No',
    searchValue: testData.nodeEnergyAnalysis.f11Number,
    openTab: async (page) => page.openOutgoing11KvFeedersTab(),
    search: async (page, value) => page.searchByFeeder11Number(value),
  },
];

test.describe('Node Energy Analysis', () => {
  test.setTimeout(180_000);

  nodeEnergyCases.forEach(({ title, numberLabel, searchValue, openTab, search }) => {
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

        expect(result.delta).toBeCloseTo((readings.par as number) - (readings.lar as number), 6);

        if ((readings.par as number) > (readings.lar as number)) {
          expect(result.delta).toBeGreaterThan(0);
        } else if ((readings.par as number) === (readings.lar as number)) {
          expect(result.delta).toBe(0);
        } else {
          expect(result.delta).toBeLessThan(0);
          expect(result.isNegative).toBeTruthy();
        }
      });
    });
  });
});