const { expect } = require('@playwright/test');

class AdministrativeDashboardPage {
  constructor(page) {
    this.page = page;

    this.administrativeDashboardMenu = page.getByText('Administrative Dashboard', { exact: true });
    this.communicationQuickNav = page.getByText('Communication', { exact: true });
    this.assetSectionHeader = page.getByText(
      'Asset Communicating and Non-communicating Analysis',
      { exact: true }
    );
  }

  async openAdministrativeDashboard() {
    await expect(this.administrativeDashboardMenu).toBeVisible({ timeout: 90_000 });
    await this.administrativeDashboardMenu.click();

    await expect(this.page).toHaveURL(/\/network-management\/administrative-dashboard/i, {
      timeout: 90_000
    });
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/network-management\/administrative-dashboard/i, {
      timeout: 90_000
    });
  }

  async openCommunicationSection() {
    await expect(this.communicationQuickNav).toBeVisible({ timeout: 90_000 });
    await this.communicationQuickNav.scrollIntoViewIfNeeded();
    await this.communicationQuickNav.click();

    await expect(this.assetSectionHeader).toBeVisible({ timeout: 90_000 });
  }

  getAssetSection() {
    return this.page.locator('#communcation');
  }

  getCardByTitle(title) {
    return this.getAssetSection()
      .locator('.asset-card')
      .filter({
        has: this.page.locator('.header span.name').filter({ hasText: new RegExp(`^${title}$`) })
      })
      .first();
  }

  async readNumber(locator, errorMessage) {
    await expect(locator).toBeVisible({ timeout: 30_000 });

    const text = (await locator.textContent())?.trim() || '';
    const value = Number(text.replace(/,/g, ''));

    if (Number.isNaN(value)) {
      throw new Error(`${errorMessage}. Found text: "${text}"`);
    }

    return value;
  }

  async getTotalFromCard(card) {
    const totalLocator = card.locator('.header span.value').first();
    return this.readNumber(totalLocator, 'Could not read total value');
  }

  async getValueByLabel(card, labelText) {
    const label = card
      .locator('span.name')
      .filter({ hasText: new RegExp(`^${labelText}$`) })
      .first();

    await expect(label).toBeVisible({ timeout: 30_000 });

    const row = label.locator('xpath=ancestor::div[contains(@class,"justify-content-between")][1]');
    await expect(row).toBeVisible({ timeout: 30_000 });

    const valueLocator = row.locator('span.value').first();
    return this.readNumber(valueLocator, `Could not read ${labelText} value`);
  }

  async getCommunicatingFromCard(card) {
    return this.getValueByLabel(card, 'Communicating');
  }

  async getNonCommunicatingFromCard(card) {
    return this.getValueByLabel(card, 'Non Communicating');
  }

  async waitForCardMetricsToLoad(title) {
    const card = this.getCardByTitle(title);
    await expect(card).toBeVisible({ timeout: 90_000 });

    await expect(async () => {
      const total = await this.getTotalFromCard(card);
      const communicating = await this.getCommunicatingFromCard(card);
      const nonCommunicating = await this.getNonCommunicatingFromCard(card);

      expect(Number.isNaN(total)).toBeFalsy();
      expect(Number.isNaN(communicating)).toBeFalsy();
      expect(Number.isNaN(nonCommunicating)).toBeFalsy();

      // Guard against premature read of initial empty/placeholder state.
      expect(total === 0 && communicating === 0 && nonCommunicating === 0).toBeFalsy();
    }).toPass({ timeout: 90_000, intervals: [1000, 2000, 3000] });
  }

  async getCardMetrics(title) {
    await this.waitForCardMetricsToLoad(title);

    const card = this.getCardByTitle(title);

    const total = await this.getTotalFromCard(card);
    const communicating = await this.getCommunicatingFromCard(card);
    const nonCommunicating = await this.getNonCommunicatingFromCard(card);

    return {
      title,
      communicating,
      nonCommunicating,
      total
    };
  }

  async getAllAssetCommunicationMetrics() {
    const feeders33 = await this.getCardMetrics('33KV Feeders');
    const feeders11 = await this.getCardMetrics('11KV Feeders');
    const distributionTransformers = await this.getCardMetrics('Distribution Transformers');

    return {
      feeders33,
      feeders11,
      distributionTransformers
    };
  }

  async logAllAssetCommunicationMetrics() {
    const metrics = await this.getAllAssetCommunicationMetrics();

    console.log(
      `33KV Feeders: Communicating: ${metrics.feeders33.communicating}, Non Communicating: ${metrics.feeders33.nonCommunicating}, Total: ${metrics.feeders33.total}`
    );
    console.log(
      `11KV Feeders: Communicating: ${metrics.feeders11.communicating}, Non Communicating: ${metrics.feeders11.nonCommunicating}, Total: ${metrics.feeders11.total}`
    );
    console.log(
      `Distribution Transformers: Communicating: ${metrics.distributionTransformers.communicating}, Non Communicating: ${metrics.distributionTransformers.nonCommunicating}, Total: ${metrics.distributionTransformers.total}`
    );

    return metrics;
  }
}

module.exports = { AdministrativeDashboardPage };