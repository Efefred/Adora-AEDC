const { expect } = require('@playwright/test');

class DashboardPage {
  constructor(page) {
    this.page = page;

    this.gridEnergyProfileMenu = page.getByText('Grid Energy Profile', { exact: true }).first();
    this.nodeEnergyAnalysisSubmenu = page.getByText('Node Energy Analysis', { exact: true }).first();
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/network-management\/dashboard/);
    await expect(this.gridEnergyProfileMenu).toBeVisible();
  }

  async expandGridEnergyProfileMenu() {
    await expect(this.gridEnergyProfileMenu).toBeVisible({ timeout: 30000 });

    if (!(await this.nodeEnergyAnalysisSubmenu.isVisible().catch(() => false))) {
      await this.gridEnergyProfileMenu.click();
    }

    await expect(this.nodeEnergyAnalysisSubmenu).toBeVisible({ timeout: 30000 });
  }

  async goToNodeEnergyAnalysis() {
    await this.expandGridEnergyProfileMenu();
    await this.nodeEnergyAnalysisSubmenu.click();

    await expect(this.page).toHaveURL(/\/network-management\/grid-energy-profile/i, {
      timeout: 90000
    });
  }
}

module.exports = { DashboardPage };