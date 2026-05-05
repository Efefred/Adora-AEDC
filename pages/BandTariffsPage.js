const { expect } = require('@playwright/test');

class BandTariffsPage {
  constructor(page) {
    this.page = page;

    this.settingsMenu = page.getByText('Settings', { exact: true });
    this.generalMenu = page.getByText('General', { exact: true });
    this.tariffsMenu = page.getByText('Tariffs', { exact: true });
    this.bandTariffsMenu = page.getByText('Band Tariffs', { exact: true });
    this.bandTariffsHeader = page.getByText('Band Tariffs', { exact: true });
  }

  normalizeText(text) {
    return String(text).replace(/\s+/g, ' ').trim();
  }

  async openBandTariffs() {
    await this.settingsMenu.click();
    await this.generalMenu.click();
    await this.tariffsMenu.click();
    await this.bandTariffsMenu.click();

    await expect(this.bandTariffsHeader).toBeVisible({ timeout: 30_000 });
  }

  async getTariffRateForBand(bandName) {
    const row = this.page
      .locator('tr, [role="row"]')
      .filter({ hasText: bandName })
      .first();

    await expect(row).toBeVisible({ timeout: 30_000 });

    const cells = row.locator('td, [role="cell"]');
    const cellCount = await cells.count();

    if (cellCount < 2) {
      throw new Error(`Could not resolve tariff row cells for ${bandName}`);
    }

    const rateText = this.normalizeText(await cells.nth(1).innerText());
    const rate = Number(rateText.replace(/,/g, '').trim());

    if (Number.isNaN(rate)) {
      throw new Error(`Invalid tariff rate for ${bandName}: "${rateText}"`);
    }

    return rate;
  }
}

module.exports = { BandTariffsPage };