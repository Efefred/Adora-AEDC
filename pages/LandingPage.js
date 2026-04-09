const { expect } = require('@playwright/test');

class LandingPage {
  constructor(page) {
    this.page = page;

    this.networkManagementTile = page.locator('div.menu-card', {
      has: page.locator('div.menu-title', { hasText: 'Network' })
    }).filter({ hasText: 'Management' });
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/global-landing-page/);
    await expect(this.networkManagementTile).toBeVisible();
  }

  async openNetworkManagement() {
    await Promise.all([
      this.page.waitForURL(/\/network-management\/dashboard/i),
      this.networkManagementTile.click()
    ]);
  }
}

module.exports = { LandingPage };