const { expect } = require('@playwright/test');

class AdministrativeDashboardPage {
  constructor(page) {
    this.page = page;

    // Analytics menu
    this.analyticsMenu = page.locator(
      'div.menu-item:has(span:text-is("Analytics"))'
    );

    // First Performance Console under Analytics
    this.performanceConsoleMenu = page
      .locator('div.dropmenu-item')
      .filter({
        has: page.locator('span', {
          hasText: /^Performance Console$/
        })
      })
      .first();

    // Quick Navigation
    this.communicationQuickNav = page.getByText(
      'Communication',
      { exact: true }
    );

    this.communicationByBandsQuickNav = page.getByText(
      'Communication By Bands',
      { exact: true }
    );

    // Section Headers
    this.assetSectionHeader = page.getByText(
      'Asset Communicating and Non-communicating Analysis',
      { exact: true }
    );

    this.communicationByBandsSectionHeader = page.getByText(
      'Communicating and Non-communicating by Bands',
      { exact: true }
    );
  }

  async openAdministrativeDashboard() {
    await expect(this.analyticsMenu).toBeVisible({
      timeout: 90000
    });

    // Expand Analytics if collapsed
    if (!(await this.performanceConsoleMenu.isVisible().catch(() => false))) {
      await this.analyticsMenu.click();
    }

    await this.performanceConsoleMenu.waitFor({
      state: 'visible',
      timeout: 90000
    });

    await this.performanceConsoleMenu.click();

    await expect(this.page).toHaveURL(
      /\/network-management\/administrative-dashboard/i,
      {
        timeout: 90000
      }
    );
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(
      /\/network-management\/administrative-dashboard/i,
      {
        timeout: 90000
      }
    );
  }

  async openCommunicationSection() {
    await expect(this.communicationQuickNav).toBeVisible({
      timeout: 90000
    });

    await this.communicationQuickNav.scrollIntoViewIfNeeded();
    await this.communicationQuickNav.click();

    await expect(this.assetSectionHeader).toBeVisible({
      timeout: 90000
    });
  }

  async openCommunicationByBandsSection() {
    await expect(this.communicationByBandsQuickNav).toBeVisible({
      timeout: 90000
    });

    await this.communicationByBandsQuickNav.scrollIntoViewIfNeeded();
    await this.communicationByBandsQuickNav.click();

    await expect(this.communicationByBandsSectionHeader).toBeVisible({
      timeout: 90000
    });
  }

  getAssetSection() {
    return this.page.locator('#communcation');
  }

  getCommunicationByBandsSection() {
    return this.page.locator('#communcation-bands');
  }

  getCardByTitle(title) {
    return this.getAssetSection()
      .locator('.asset-card')
      .filter({
        has: this.page.locator('.header span.name').filter({
          hasText: new RegExp(`^${title}$`)
        })
      })
      .first();
  }

  getCommunicationByBandsCardByTitle(title) {
    return this.getCommunicationByBandsSection()
      .locator('.asset-card')
      .filter({
        has: this.page.locator('.header span.name').filter({
          hasText: new RegExp(`^${title}$`)
        })
      })
      .first();
  }

  async readNumber(locator, errorMessage) {
    await expect(locator).toBeVisible({
      timeout: 30000
    });

    const text = (await locator.textContent())?.trim() || '';

    const value = Number(
      text
        .replace(/,/g, '')
        .replace('%', '')
    );

    if (Number.isNaN(value)) {
      throw new Error(
        `${errorMessage}. Found text: "${text}"`
      );
    }

    return value;
  }

  async getTotalFromCard(card) {
    const totalLocator = card.locator('.header span.value').first();
    return this.readNumber(
      totalLocator,
      'Could not read total value'
    );
  }

  async getValueByLabel(card, labelText) {
    const label = card
      .locator('span.name')
      .filter({
        hasText: new RegExp(`^${labelText}$`)
      })
      .first();

    await expect(label).toBeVisible({
      timeout: 30000
    });

    const row = label.locator(
      'xpath=ancestor::div[contains(@class,"justify-content-between")][1]'
    );

    await expect(row).toBeVisible({
      timeout: 30000
    });

    const valueLocator = row.locator('span.value').first();

    return this.readNumber(
      valueLocator,
      `Could not read ${labelText} value`
    );
  }

  async getCommunicatingFromCard(card) {
    return this.getValueByLabel(card, 'Communicating');
  }

  async getNonCommunicatingFromCard(card) {
    return this.getValueByLabel(card, 'Non Communicating');
  }

  async waitForCardMetricsToLoad(title) {
    const card = this.getCardByTitle(title);

    await expect(card).toBeVisible({
      timeout: 90000
    });

    await expect(async () => {
      const total = await this.getTotalFromCard(card);
      const communicating = await this.getCommunicatingFromCard(card);
      const nonCommunicating =
        await this.getNonCommunicatingFromCard(card);

      expect(Number.isNaN(total)).toBeFalsy();
      expect(Number.isNaN(communicating)).toBeFalsy();
      expect(Number.isNaN(nonCommunicating)).toBeFalsy();

      expect(
        total === 0 &&
        communicating === 0 &&
        nonCommunicating === 0
      ).toBeFalsy();
    }).toPass({
      timeout: 90000,
      intervals: [1000, 2000, 3000]
    });
  }

  async getCardMetrics(title) {
    await this.waitForCardMetricsToLoad(title);

    const card = this.getCardByTitle(title);

    return {
      title,
      communicating: await this.getCommunicatingFromCard(card),
      nonCommunicating: await this.getNonCommunicatingFromCard(card),
      total: await this.getTotalFromCard(card)
    };
  }

  async getAllAssetCommunicationMetrics() {
    return {
      feeders33: await this.getCardMetrics('33KV Feeders'),
      feeders11: await this.getCardMetrics('11KV Feeders'),
      distributionTransformers: await this.getCardMetrics(
        'Distribution Transformers'
      )
    };
  }

  async getBandCountAndPercentage(card, groupClass, bandName) {
    const groupBlock = card
      .locator(`.${groupClass}`)
      .locator(
        'xpath=ancestor::div[contains(@class,"col-12")][1]'
      );

    const bandRow = groupBlock
      .locator('.communicating-border .ng-star-inserted')
      .filter({
        has: this.page.locator('span').filter({
          hasText: new RegExp(`^${bandName}$`)
        })
      })
      .first();

    await expect(bandRow).toBeVisible({
      timeout: 30000
    });

    const countText =
      (await bandRow
        .locator('span.mr-3')
        .first()
        .textContent())?.trim() || '';

    const percentageText =
      (await bandRow
        .locator('span.percent-value')
        .first()
        .textContent())?.trim() || '';

    return {
      count: Number(countText.replace(/,/g, '')),
      percentage: percentageText,
      raw: `${countText} ${percentageText}`
    };
  }

  async getCommunicationByBandsCardMetrics(title) {
    const card =
      this.getCommunicationByBandsCardByTitle(title);

    await expect(card).toBeVisible({
      timeout: 90000
    });

    const total = await this.getTotalFromCard(card);

    const communicating = await this.readNumber(
      card.locator('.communicating span.value').first(),
      `Could not read ${title} communicating value`
    );

    const nonCommunicating = await this.readNumber(
      card.locator('.non-communicating span.value').first(),
      `Could not read ${title} non communicating value`
    );

    const bandNames = [
      'Band A',
      'Band B',
      'Band C',
      'Band D',
      'Band E'
    ];

    const communicatingBands = {};
    const nonCommunicatingBands = {};

    for (const bandName of bandNames) {
      communicatingBands[bandName] =
        await this.getBandCountAndPercentage(
          card,
          'communicating',
          bandName
        );

      nonCommunicatingBands[bandName] =
        await this.getBandCountAndPercentage(
          card,
          'non-communicating',
          bandName
        );
    }

    return {
      title,
      total,
      communicating,
      nonCommunicating,
      communicatingBands,
      nonCommunicatingBands
    };
  }

  async getAllCommunicationByBandsMetrics() {
    return {
      feeders33:
        await this.getCommunicationByBandsCardMetrics(
          '33KV Feeders'
        ),

      feeders11:
        await this.getCommunicationByBandsCardMetrics(
          '11KV Feeders'
        ),

      distributionTransformers:
        await this.getCommunicationByBandsCardMetrics(
          'Distribution Transformers'
        )
    };
  }
}

module.exports = {
  AdministrativeDashboardPage
};