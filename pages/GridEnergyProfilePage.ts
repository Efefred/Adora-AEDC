// import { expect, Locator, Page } from '@playwright/test';
// import { NodeEnergyAnalysisHelper } from '../utils/nodeEnergyAnalysisHelper';

// export class GridEnergyProfilePage {
//   readonly page: Page;

//   readonly pageHeader: Locator;
//   readonly distributionTransformerTab: Locator;
//   readonly searchInput: Locator;
//   readonly larHeader: Locator;
//   readonly parHeader: Locator;

//   constructor(page: Page) {
//     this.page = page;

//     this.pageHeader = page.getByRole('main').getByText('Grid Energy Profile', { exact: true });
//     this.distributionTransformerTab = page.getByText('Distribution Transformer', { exact: true });

//     this.searchInput = page.getByRole('textbox', {
//       name: 'Search by DT name or number'
//     });

//     this.larHeader = page.getByRole('main').getByText('LAR (MWH)', { exact: true }).first();
//     this.parHeader = page.getByRole('main').getByText('PAR (MWH)', { exact: true }).first();
//   }

//   async assertLoaded() {
//     await expect(this.page).toHaveURL(/\/network-management\/grid-energy-profile/i);
//     await expect(this.pageHeader).toBeVisible({ timeout: 90_000 });
//     await expect(this.distributionTransformerTab).toBeVisible({ timeout: 90_000 });
//   }

//   async openDistributionTransformerTab() {
//     await expect(this.distributionTransformerTab).toBeVisible({ timeout: 90_000 });
//     await this.distributionTransformerTab.click();

//     await expect(this.searchInput).toBeVisible({ timeout: 90_000 });
//     await this.waitForTableToBeReady();
//   }

//   async waitForTableToBeReady() {
//     await expect(this.larHeader).toBeVisible({ timeout: 90_000 });
//     await expect(this.parHeader).toBeVisible({ timeout: 90_000 });
//   }

//   getSearchSuggestion(searchValue: string): Locator {
//     return this.page.getByText(searchValue, { exact: true }).last();
//   }

//   async searchByMeterNumber(meterNumber: string) {
//     await expect(this.searchInput).toBeVisible({ timeout: 90_000 });
//     await this.searchInput.fill(meterNumber);

//     const suggestion = this.getSearchSuggestion(meterNumber);
//     await expect(suggestion).toBeVisible({ timeout: 30_000 });
//     await suggestion.click();

//     await expect(this.getRowBySearchValue(meterNumber)).toBeVisible({ timeout: 90_000 });
//   }

//   getRowBySearchValue(searchValue: string): Locator {
//     return this.page.locator('tbody tr').filter({ hasText: searchValue }).first();
//   }

//   private async getCellTextUnderHeader(row: Locator, header: Locator, headerName: string): Promise<string> {
//     await row.scrollIntoViewIfNeeded();
//     await header.scrollIntoViewIfNeeded();

//     const headerBox = await header.boundingBox();
//     if (!headerBox) {
//       throw new Error(`Could not get bounding box for header: ${headerName}`);
//     }

//     const headerCenterX = headerBox.x + headerBox.width / 2;

//     const cells = row.locator('td');
//     const cellCount = await cells.count();

//     if (cellCount === 0) {
//       throw new Error('No td cells found in the matched row.');
//     }

//     for (let i = 0; i < cellCount; i++) {
//       const cell = cells.nth(i);
//       const cellBox = await cell.boundingBox();

//       if (!cellBox) continue;

//       const cellStartX = cellBox.x;
//       const cellEndX = cellBox.x + cellBox.width;

//       if (headerCenterX >= cellStartX && headerCenterX <= cellEndX) {
//         return (await cell.innerText()).trim();
//       }
//     }

//     throw new Error(`Could not find row cell aligned under header: ${headerName}`);
//   }

//   async getLarAndParRawValues(searchValue: string): Promise<{ larRaw: string; parRaw: string }> {
//     const row = this.getRowBySearchValue(searchValue);
//     await expect(row).toBeVisible({ timeout: 90_000 });

//     const larRaw = await this.getCellTextUnderHeader(row, this.larHeader, 'LAR (MWH)');
//     const parRaw = await this.getCellTextUnderHeader(row, this.parHeader, 'PAR (MWH)');

//     return { larRaw, parRaw };
//   }

//   async getLarAndParParsedValues(searchValue: string): Promise<{
//     larRaw: string;
//     parRaw: string;
//     lar: number | null;
//     par: number | null;
//   }> {
//     const { larRaw, parRaw } = await this.getLarAndParRawValues(searchValue);

//     const larParsed = NodeEnergyAnalysisHelper.parseReading(larRaw);
//     const parParsed = NodeEnergyAnalysisHelper.parseReading(parRaw);

//     return {
//       larRaw,
//       parRaw,
//       lar: larParsed.value,
//       par: parParsed.value
//     };
//   }
// }



// import { expect, Locator, Page } from '@playwright/test';
// import { NodeEnergyAnalysisHelper } from '../utils/nodeEnergyAnalysisHelper';

// type SearchMode = 'dt' | 'f33' | 'f11';

// export class GridEnergyProfilePage {
//   readonly page: Page;

//   readonly pageHeader: Locator;

//   readonly distributionTransformerTab: Locator;
//   readonly outgoing33KvFeedersTab: Locator;
//   readonly outgoing11KvFeedersTab: Locator;

//   readonly dtSearchInput: Locator;
//   readonly feeder33SearchInput: Locator;
//   readonly feeder11SearchInput: Locator;

//   constructor(page: Page) {
//     this.page = page;

//     this.pageHeader = page.getByRole('main').getByText('Grid Energy Profile', { exact: true });

//     this.distributionTransformerTab = page.getByText('Distribution Transformer', { exact: true });

//     this.outgoing33KvFeedersTab = page.getByText('Outgoing 33KV Feeders', { exact: true });
//     this.feeder33SearchInput = page.getByRole('textbox', {
//       name: 'Search by Feeder 33 name or number'
//     });

//     this.outgoing11KvFeedersTab = page.getByText('Outgoing 11KV Feeders', { exact: true });
//     this.feeder11SearchInput = page.getByRole('textbox', {
//       name: 'Search by Feeder 11 name or number'
//     });

//     this.dtSearchInput = page.getByRole('textbox', {
//       name: 'Search by DT name or number'
//     });
//   }

//   async assertLoaded() {
//     await expect(this.page).toHaveURL(/\/network-management\/grid-energy-profile/i);
//     await expect(this.pageHeader).toBeVisible({ timeout: 90_000 });
//   }

//   async openDistributionTransformerTab() {
//     await expect(this.distributionTransformerTab).toBeVisible({ timeout: 90_000 });
//     await this.distributionTransformerTab.click();
//     await expect(this.dtSearchInput).toBeVisible({ timeout: 90_000 });
//   }

//   async openOutgoing33KvFeedersTab() {
//     await expect(this.outgoing33KvFeedersTab).toBeVisible({ timeout: 90_000 });
//     await this.outgoing33KvFeedersTab.click();
//     await expect(this.feeder33SearchInput).toBeVisible({ timeout: 90_000 });
//   }

//   async openOutgoing11KvFeedersTab() {
//     await expect(this.outgoing11KvFeedersTab).toBeVisible({ timeout: 90_000 });
//     await this.outgoing11KvFeedersTab.click();
//     await expect(this.feeder11SearchInput).toBeVisible({ timeout: 90_000 });
//   }

//   private getSearchInput(mode: SearchMode): Locator {
//     if (mode === 'dt') return this.dtSearchInput;
//     if (mode === 'f33') return this.feeder33SearchInput;
//     return this.feeder11SearchInput;
//   }

//   private getSearchSuggestion(searchValue: string): Locator {
//     return this.page.getByText(searchValue, { exact: true }).last();
//   }

//   private getRowBySearchValue(searchValue: string): Locator {
//     return this.page.locator('tbody tr, [role="row"]').filter({ hasText: searchValue }).first();
//   }

//   async searchByDtNumber(dtNumber: string) {
//     await this.searchWithDropdown('dt', dtNumber);
//   }

//   async searchByFeeder33Number(feeder33Number: string) {
//     await this.searchWithDropdown('f33', feeder33Number);
//   }

//   async searchByFeeder11Number(feeder11Number: string) {
//     await this.searchWithDropdown('f11', feeder11Number);
//   }

//   private async searchWithDropdown(mode: SearchMode, searchValue: string) {
//     const input = this.getSearchInput(mode);

//     await expect(input).toBeVisible({ timeout: 90_000 });
//     await input.fill(searchValue);

//     const suggestion = this.getSearchSuggestion(searchValue);
//     await expect(suggestion).toBeVisible({ timeout: 30_000 });
//     await suggestion.click();

//     await expect(this.getRowBySearchValue(searchValue)).toBeVisible({ timeout: 90_000 });
//   }

//   private getColumnHeader(headerName: string): Locator {
//     return this.page
//       .locator('th:visible, [role="columnheader"]:visible')
//       .filter({ hasText: headerName })
//       .first();
//   }

//   private async getColumnIndexByHeader(headerName: string): Promise<number> {
//     const header = this.getColumnHeader(headerName);
//     await expect(header).toBeVisible({ timeout: 90_000 });

//     const ariaColIndex = await header.getAttribute('aria-colindex');
//     if (ariaColIndex) {
//       return Number(ariaColIndex) - 1;
//     }

//     const headers = this.page.locator('th:visible, [role="columnheader"]:visible');
//     const headerCount = await headers.count();

//     for (let i = 0; i < headerCount; i++) {
//       const text = (await headers.nth(i).innerText()).trim();
//       if (text === headerName) {
//         return i;
//       }
//     }

//     throw new Error(`Column header not found: ${headerName}`);
//   }

//   private async getCellTextByHeader(searchValue: string, headerName: string): Promise<string> {
//     const row = this.getRowBySearchValue(searchValue);
//     await expect(row).toBeVisible({ timeout: 90_000 });

//     const columnIndex = await this.getColumnIndexByHeader(headerName);
//     const oneBasedColIndex = String(columnIndex + 1);

//     const ariaCell = row
//       .locator(`td[aria-colindex="${oneBasedColIndex}"], [role="cell"][aria-colindex="${oneBasedColIndex}"]`)
//       .first();

//     if (await ariaCell.count()) {
//       return (await ariaCell.innerText()).trim();
//     }

//     const cells = row.locator('td, [role="cell"]');
//     const cellCount = await cells.count();

//     if (cellCount === 0) {
//       throw new Error(`No cells found in row for value: ${searchValue}`);
//     }

//     if (columnIndex >= cellCount) {
//       throw new Error(
//         `Resolved column index ${columnIndex} for "${headerName}" is out of range. Row has ${cellCount} cells.`
//       );
//     }

//     return (await cells.nth(columnIndex).innerText()).trim();
//   }

//   async getLarAndParParsedValues(searchValue: string): Promise<{
//     larRaw: string;
//     parRaw: string;
//     lar: number | null;
//     par: number | null;
//   }> {
//     const larRaw = await this.getCellTextByHeader(searchValue, 'LAR (MWH)');
//     const parRaw = await this.getCellTextByHeader(searchValue, 'PAR (MWH)');

//     const larParsed = NodeEnergyAnalysisHelper.parseReading(larRaw);
//     const parParsed = NodeEnergyAnalysisHelper.parseReading(parRaw);

//     return {
//       larRaw,
//       parRaw,
//       lar: larParsed.value,
//       par: parParsed.value
//     };
//   }
// }


import { expect, Locator, Page } from '@playwright/test';
import { NodeEnergyAnalysisHelper } from '../utils/nodeEnergyAnalysisHelper';

type SearchMode = 'dt' | 'f33' | 'f11';

export class GridEnergyProfilePage {
  readonly page: Page;

  readonly pageHeader: Locator;

  readonly distributionTransformerTab: Locator;
  readonly outgoing33KvFeedersTab: Locator;
  readonly outgoing11KvFeedersTab: Locator;

  readonly dtSearchInput: Locator;
  readonly feeder33SearchInput: Locator;
  readonly feeder11SearchInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeader = page.getByRole('main').getByText('Grid Energy Profile', { exact: true });

    this.distributionTransformerTab = page.getByText('Distribution Transformer', { exact: true });

    this.outgoing33KvFeedersTab = page.getByText('Outgoing 33KV Feeders', { exact: true });
    this.feeder33SearchInput = page.getByRole('textbox', {
      name: 'Search by Feeder 33 name or number'
    });

    this.outgoing11KvFeedersTab = page.getByText('Outgoing 11KV Feeders', { exact: true });
    this.feeder11SearchInput = page.getByRole('textbox', {
      name: 'Search by Feeder 11 name or number'
    });

    this.dtSearchInput = page.getByRole('textbox', {
      name: 'Search by DT name or number'
    });
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/network-management\/grid-energy-profile/i);
    await expect(this.pageHeader).toBeVisible({ timeout: 90_000 });
  }

  async openDistributionTransformerTab() {
    await expect(this.distributionTransformerTab).toBeVisible({ timeout: 90_000 });
    await this.distributionTransformerTab.click();
    await expect(this.dtSearchInput).toBeVisible({ timeout: 90_000 });
  }

  async openOutgoing33KvFeedersTab() {
    await expect(this.outgoing33KvFeedersTab).toBeVisible({ timeout: 90_000 });
    await this.outgoing33KvFeedersTab.click();
    await expect(this.feeder33SearchInput).toBeVisible({ timeout: 90_000 });
  }

  async openOutgoing11KvFeedersTab() {
    await expect(this.outgoing11KvFeedersTab).toBeVisible({ timeout: 90_000 });
    await this.outgoing11KvFeedersTab.click();
    await expect(this.feeder11SearchInput).toBeVisible({ timeout: 90_000 });
  }

  private getSearchInput(mode: SearchMode): Locator {
    if (mode === 'dt') return this.dtSearchInput;
    if (mode === 'f33') return this.feeder33SearchInput;
    return this.feeder11SearchInput;
  }

  private getSearchSuggestion(searchValue: string): Locator {
    return this.page.getByText(searchValue, { exact: true }).last();
  }

  private getExactRowBySearchValue(searchValue: string): Locator {
    return this.page.locator('tbody tr, [role="row"]').filter({ hasText: searchValue }).first();
  }

  private getAllDataRows(): Locator {
    return this.page
      .locator('tbody tr, [role="row"]')
      .filter({ has: this.page.locator('td, [role="cell"]') });
  }

  private async getResultRow(searchValue: string): Promise<Locator> {
    const exactRow = this.getExactRowBySearchValue(searchValue);

    if (await exactRow.count()) {
      return exactRow;
    }

    const firstRow = this.getAllDataRows().first();
    await expect(firstRow).toBeVisible({ timeout: 90_000 });
    return firstRow;
  }

  async searchByDtNumber(dtNumber: string) {
    await this.searchWithDropdown('dt', dtNumber);
  }

  async searchByFeeder33Number(feeder33Number: string) {
    await this.searchWithDropdown('f33', feeder33Number);
  }

  async searchByFeeder11Number(feeder11Number: string) {
    await this.searchWithDropdown('f11', feeder11Number);
  }

  private async searchWithDropdown(mode: SearchMode, searchValue: string) {
    const input = this.getSearchInput(mode);

    await expect(input).toBeVisible({ timeout: 90_000 });
    await input.fill(searchValue);

    const suggestion = this.getSearchSuggestion(searchValue);
    await expect(suggestion).toBeVisible({ timeout: 30_000 });
    await suggestion.click();

    // Wait for any real data row to appear after filtering
    const firstRow = this.getAllDataRows().first();
    await expect(firstRow).toBeVisible({ timeout: 90_000 });
  }

  private getColumnHeader(headerName: string): Locator {
    return this.page
      .locator('th:visible, [role="columnheader"]:visible')
      .filter({ hasText: headerName })
      .first();
  }

  private async getColumnIndexByHeader(headerName: string): Promise<number> {
    const header = this.getColumnHeader(headerName);
    await expect(header).toBeVisible({ timeout: 90_000 });

    const ariaColIndex = await header.getAttribute('aria-colindex');
    if (ariaColIndex) {
      return Number(ariaColIndex) - 1;
    }

    const headers = this.page.locator('th:visible, [role="columnheader"]:visible');
    const headerCount = await headers.count();

    for (let i = 0; i < headerCount; i++) {
      const text = (await headers.nth(i).innerText()).trim();
      if (text === headerName) {
        return i;
      }
    }

    throw new Error(`Column header not found: ${headerName}`);
  }

  private async getCellTextByHeader(searchValue: string, headerName: string): Promise<string> {
    const row = await this.getResultRow(searchValue);
    await expect(row).toBeVisible({ timeout: 90_000 });

    const columnIndex = await this.getColumnIndexByHeader(headerName);
    const oneBasedColIndex = String(columnIndex + 1);

    const ariaCell = row
      .locator(`td[aria-colindex="${oneBasedColIndex}"], [role="cell"][aria-colindex="${oneBasedColIndex}"]`)
      .first();

    if (await ariaCell.count()) {
      return (await ariaCell.innerText()).trim();
    }

    const cells = row.locator('td, [role="cell"]');
    const cellCount = await cells.count();

    if (cellCount === 0) {
      throw new Error(`No cells found in result row for value: ${searchValue}`);
    }

    if (columnIndex >= cellCount) {
      throw new Error(
        `Resolved column index ${columnIndex} for "${headerName}" is out of range. Row has ${cellCount} cells.`
      );
    }

    return (await cells.nth(columnIndex).innerText()).trim();
  }

  async getLarAndParParsedValues(searchValue: string): Promise<{
    larRaw: string;
    parRaw: string;
    lar: number | null;
    par: number | null;
  }> {
    const larRaw = await this.getCellTextByHeader(searchValue, 'LAR (MWH)');
    const parRaw = await this.getCellTextByHeader(searchValue, 'PAR (MWH)');

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