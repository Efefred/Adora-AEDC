import { expect, Locator, Page } from '@playwright/test';
import { NodeEnergyAnalysisHelper } from '../utils/nodeEnergyAnalysisHelper';

export class GridEnergyProfilePage {
  readonly page: Page;

  readonly pageHeader: Locator;
  readonly distributionTransformerTab: Locator;
  readonly searchInput: Locator;
  readonly larHeader: Locator;
  readonly parHeader: Locator;
  readonly tableHeaderCells: Locator;
  readonly tableBodyRows: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeader = page.getByRole('main').getByText('Grid Energy Profile', { exact: true });
    this.distributionTransformerTab = page.getByText('Distribution Transformer', { exact: true });
    this.searchInput = page.getByRole('textbox', { name: 'Search by DT name or number' });
    this.larHeader = page.getByText('LAR (MWH)', { exact: true });
    this.parHeader = page.getByText('PAR (MWH)', { exact: true });

    this.tableHeaderCells = page.locator('thead tr th');
    this.tableBodyRows = page.locator('tbody tr');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/network-management\/grid-energy-profile/i);
    await expect(this.pageHeader).toBeVisible();
    await expect(this.distributionTransformerTab).toBeVisible();
    await expect(this.searchInput).toBeVisible();
  }

  async openDistributionTransformerTab() {
    await expect(this.distributionTransformerTab).toBeVisible({ timeout: 90_000 });
    await this.distributionTransformerTab.click();

    await this.waitForTableToBeReady();
  }

  async waitForTableToBeReady() {
    await expect(this.larHeader).toBeVisible({ timeout: 90_000 });
    await expect(this.parHeader).toBeVisible({ timeout: 90_000 });
    await expect(this.tableHeaderCells.first()).toBeVisible({ timeout: 90_000 });
  }

  async searchByMeterNumber(meterNumber: string) {
    await expect(this.searchInput).toBeVisible({ timeout: 60_000 });
    await this.searchInput.fill(meterNumber);
    await this.searchInput.press('Enter');

    await expect(this.getRowBySearchValue(meterNumber)).toBeVisible({ timeout: 90_000 });
  }

  getRowBySearchValue(searchValue: string): Locator {
    return this.page.locator('tbody tr').filter({ hasText: searchValue }).first();
  }

  private getHeaderCells(): Locator {
    return this.tableHeaderCells;
  }

  private async getColumnIndex(headerName: string): Promise<number> {
    const headers = this.getHeaderCells();
    const count = await headers.count();

    for (let i = 0; i < count; i++) {
      const text = (await headers.nth(i).innerText()).trim();
      if (text === headerName) {
        return i;
      }
    }

    throw new Error(`Column header not found: ${headerName}`);
  }

  async getLarAndParRawValues(searchValue: string): Promise<{ larRaw: string; parRaw: string }> {
    const row = this.getRowBySearchValue(searchValue);
    await expect(row).toBeVisible({ timeout: 90_000 });

    const larIndex = await this.getColumnIndex('LAR (MWH)');
    const parIndex = await this.getColumnIndex('PAR (MWH)');

    const cells = row.locator('td');
    const cellCount = await cells.count();

    if (cellCount === 0) {
      throw new Error(`No table cells found in row for search value: ${searchValue}`);
    }

    const larRaw = (await cells.nth(larIndex).innerText()).trim();
    const parRaw = (await cells.nth(parIndex).innerText()).trim();

    return { larRaw, parRaw };
  }

  async getLarAndParParsedValues(searchValue: string): Promise<{
    larRaw: string;
    parRaw: string;
    lar: number | null;
    par: number | null;
  }> {
    const { larRaw, parRaw } = await this.getLarAndParRawValues(searchValue);

    const larParsed = NodeEnergyAnalysisHelper.parseReading(larRaw);
    const parParsed = NodeEnergyAnalysisHelper.parseReading(parRaw);

    return {
      larRaw,
      parRaw,
      lar: larParsed.value,
      par: parParsed.value
    };
  }
}