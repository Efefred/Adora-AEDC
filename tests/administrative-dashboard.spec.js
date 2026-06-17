const { test, expect } = require('@playwright/test');
const { LandingPage } = require('../pages/LandingPage');
const { AdministrativeDashboardPage } = require('../pages/AdministrativeDashboardPage');
const { generateCustomHtmlReport } = require('../utils/customHtmlReporter');

function formatBandMetrics(card) {
  return {
    Communicating: card.communicating,
    'Non Communicating': card.nonCommunicating,
    Total: card.total,

    'Communicating Band A': card.communicatingBands['Band A'].raw,
    'Communicating Band B': card.communicatingBands['Band B'].raw,
    'Communicating Band C': card.communicatingBands['Band C'].raw,
    'Communicating Band D': card.communicatingBands['Band D'].raw,
    'Communicating Band E': card.communicatingBands['Band E'].raw,

    'Non Communicating Band A': card.nonCommunicatingBands['Band A'].raw,
    'Non Communicating Band B': card.nonCommunicatingBands['Band B'].raw,
    'Non Communicating Band C': card.nonCommunicatingBands['Band C'].raw,
    'Non Communicating Band D': card.nonCommunicatingBands['Band D'].raw,
    'Non Communicating Band E': card.nonCommunicatingBands['Band E'].raw
  };
}

test.describe('Administrative Dashboard - Communication Analysis', () => {
  test.setTimeout(180_000);

  test('should read asset communication and communication by bands metrics', async ({ page }) => {
    const landingPage = new LandingPage(page);
    const administrativeDashboardPage = new AdministrativeDashboardPage(page);

    let assetMetrics;
    let bandMetrics;

    await test.step('Open application (authenticated)', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const stayLoggedInButton = page.getByRole('button', { name: /stay logged in/i });

      if (await stayLoggedInButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await stayLoggedInButton.click();
      }
    });

    await test.step('Navigate to Network Management', async () => {
      await landingPage.assertLoaded();
      await landingPage.openNetworkManagement();
    });

    await test.step('Open Administrative Dashboard', async () => {
      await administrativeDashboardPage.openAdministrativeDashboard();
      await administrativeDashboardPage.assertLoaded();
    });

    await test.step('Read asset communication metrics', async () => {
      await administrativeDashboardPage.openCommunicationSection();

      assetMetrics = await administrativeDashboardPage.getAllAssetCommunicationMetrics();

      console.log(
        `Asset - 33KV Feeders: Communicating: ${assetMetrics.feeders33.communicating}, Non Communicating: ${assetMetrics.feeders33.nonCommunicating}, Total: ${assetMetrics.feeders33.total}`
      );
      console.log(
        `Asset - 11KV Feeders: Communicating: ${assetMetrics.feeders11.communicating}, Non Communicating: ${assetMetrics.feeders11.nonCommunicating}, Total: ${assetMetrics.feeders11.total}`
      );
      console.log(
        `Asset - Distribution Transformers: Communicating: ${assetMetrics.distributionTransformers.communicating}, Non Communicating: ${assetMetrics.distributionTransformers.nonCommunicating}, Total: ${assetMetrics.distributionTransformers.total}`
      );

      expect(assetMetrics.feeders33.total).toBe(
        assetMetrics.feeders33.communicating + assetMetrics.feeders33.nonCommunicating
      );

      expect(assetMetrics.feeders11.total).toBe(
        assetMetrics.feeders11.communicating + assetMetrics.feeders11.nonCommunicating
      );

      expect(assetMetrics.distributionTransformers.total).toBe(
        assetMetrics.distributionTransformers.communicating +
          assetMetrics.distributionTransformers.nonCommunicating
      );

      expect(assetMetrics.feeders33.total).toBeGreaterThan(0);
      expect(assetMetrics.feeders11.total).toBeGreaterThan(0);
      expect(assetMetrics.distributionTransformers.total).toBeGreaterThan(0);
    });

    await test.step('Read communication by bands metrics', async () => {
      await administrativeDashboardPage.openCommunicationByBandsSection();

      bandMetrics = await administrativeDashboardPage.getAllCommunicationByBandsMetrics();

      console.log(
        `Bands - 33KV Feeders: Communicating: ${bandMetrics.feeders33.communicating}, Non Communicating: ${bandMetrics.feeders33.nonCommunicating}, Total: ${bandMetrics.feeders33.total}`
      );
      console.log(
        `Bands - 11KV Feeders: Communicating: ${bandMetrics.feeders11.communicating}, Non Communicating: ${bandMetrics.feeders11.nonCommunicating}, Total: ${bandMetrics.feeders11.total}`
      );
      console.log(
        `Bands - Distribution Transformers: Communicating: ${bandMetrics.distributionTransformers.communicating}, Non Communicating: ${bandMetrics.distributionTransformers.nonCommunicating}, Total: ${bandMetrics.distributionTransformers.total}`
      );

      expect(bandMetrics.feeders33.total).toBe(
        bandMetrics.feeders33.communicating + bandMetrics.feeders33.nonCommunicating
      );

      expect(bandMetrics.feeders11.total).toBe(
        bandMetrics.feeders11.communicating + bandMetrics.feeders11.nonCommunicating
      );

      expect(bandMetrics.distributionTransformers.total).toBe(
        bandMetrics.distributionTransformers.communicating +
          bandMetrics.distributionTransformers.nonCommunicating
      );

      expect(bandMetrics.feeders33.total).toBeGreaterThan(0);
      expect(bandMetrics.feeders11.total).toBeGreaterThan(0);
      expect(bandMetrics.distributionTransformers.total).toBeGreaterThan(0);
    });

    await test.step('Generate custom HTML dashboard report', async () => {
      await generateCustomHtmlReport({
        title: 'Administrative Dashboard - Communication Report',
        fileName: 'admin-dashboard-communication-report.html',
        sections: [
          {
            title: 'Asset Communicating and Non-communicating Analysis',
            cards: [
              {
                title: '33KV Feeders',
                metrics: {
                  Communicating: assetMetrics.feeders33.communicating,
                  'Non Communicating': assetMetrics.feeders33.nonCommunicating,
                  Total: assetMetrics.feeders33.total
                }
              },
              {
                title: '11KV Feeders',
                metrics: {
                  Communicating: assetMetrics.feeders11.communicating,
                  'Non Communicating': assetMetrics.feeders11.nonCommunicating,
                  Total: assetMetrics.feeders11.total
                }
              },
              {
                title: 'Distribution Transformers',
                metrics: {
                  Communicating: assetMetrics.distributionTransformers.communicating,
                  'Non Communicating': assetMetrics.distributionTransformers.nonCommunicating,
                  Total: assetMetrics.distributionTransformers.total
                }
              }
            ]
          },
          {
            title: 'Communicating and Non-communicating by Bands',
            cards: [
              {
                title: '33KV Feeders',
                metrics: formatBandMetrics(bandMetrics.feeders33)
              },
              {
                title: '11KV Feeders',
                metrics: formatBandMetrics(bandMetrics.feeders11)
              },
              {
                title: 'Distribution Transformers',
                metrics: formatBandMetrics(bandMetrics.distributionTransformers)
              }
            ]
          }
        ]
      });
    });
  });
});