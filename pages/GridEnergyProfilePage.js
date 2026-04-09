
const { expect } = require('@playwright/test');
const { NodeEnergyAnalysisHelper } = require('../utils/nodeEnergyAnalysisHelper');

class GridEnergyProfilePage {
  constructor(page) {
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

  getSearchInput(mode) {
    if (mode === 'dt') return this.dtSearchInput;
    if (mode === 'f33') return this.feeder33SearchInput;
    return this.feeder11SearchInput;
  }

  getSearchSuggestion(searchValue) {
    return this.page.getByText(searchValue, { exact: true }).last();
  }

  getExactRowBySearchValue(searchValue) {
    return this.page
      .locator('tbody tr, [role="row"]')
      .filter({
        has: this.page.locator('td, [role="cell"]').filter({ hasText: searchValue })
      })
      .last();
  }

  getAllDataRows() {
    return this.page
      .locator('tbody tr, [role="row"]')
      .filter({ has: this.page.locator('td, [role="cell"]') });
  }

  async getResultRow(searchValue) {
    const exactRow = this.getExactRowBySearchValue(searchValue);
    await expect(exactRow).toBeVisible({ timeout: 90_000 });
    return exactRow;
  }

  async searchByDtNumber(dtNumber) {
    await this.searchWithDropdown('dt', dtNumber);
  }

  async searchByFeeder33Number(feeder33Number) {
    await this.searchWithDropdown('f33', feeder33Number);
  }

  async searchByFeeder11Number(feeder11Number) {
    await this.searchWithDropdown('f11', feeder11Number);
  }

  // async searchWithDropdown(mode, searchValue) {
  //   const input = this.getSearchInput(mode);

  //   await expect(input).toBeVisible({ timeout: 90_000 });
  //   await input.click();
  //   await input.fill('');
  //   await input.fill(searchValue);
  //   await expect(input).toHaveValue(searchValue, { timeout: 10_000 });

  //   const suggestion = this.getSearchSuggestion(searchValue);
  //   await expect(suggestion).toBeVisible({ timeout: 30_000 });
  //   await suggestion.click();

  //   const matchedRow = this.getExactRowBySearchValue(searchValue);
  //   await expect(matchedRow).toBeVisible({ timeout: 90_000 });
  // }

  // async searchWithDropdown(mode, searchValue) {
  // const input = this.getSearchInput(mode);

  // await expect(input).toBeVisible({ timeout: 90_000 });
  // await input.click();
  // await input.fill('');
  // await input.fill(searchValue);
  // await expect(input).toHaveValue(searchValue, { timeout: 10_000 });

  // const suggestion = this.getSearchSuggestion(searchValue);
  // await expect(suggestion).toBeVisible({ timeout: 30_000 });
  // await expect(suggestion).toBeEnabled({ timeout: 30_000 });

  // await suggestion.scrollIntoViewIfNeeded();
  // await suggestion.click({ force: true });

  // await this.page.waitForTimeout(2000);

  // const matchedRow = this.getExactRowBySearchValue(searchValue);
  // await expect(matchedRow).toBeVisible({ timeout: 90_000 });
  // }

  async searchWithDropdown(mode, searchValue) {
  const input = this.getSearchInput(mode);

  await expect(input).toBeVisible({ timeout: 90_000 });
  await input.click();
  await input.fill('');
  await input.fill(searchValue);
  await expect(input).toHaveValue(searchValue, { timeout: 10_000 });

  const suggestion = this.getSearchSuggestion(searchValue);
  await expect(suggestion).toBeVisible({ timeout: 30_000 });

  await suggestion.scrollIntoViewIfNeeded();

  try {
    await suggestion.click({ force: true });
  } catch {
    await this.page.mouse.move(0, 0);
    await suggestion.click({ force: true });
  }

  await this.page.waitForTimeout(2000);

  const matchedRow = this.getExactRowBySearchValue(searchValue);
  await expect(matchedRow).toBeVisible({ timeout: 90_000 });
}

  getColumnHeader(headerName) {
    return this.page
      .locator('th:visible, [role="columnheader"]:visible')
      .filter({ hasText: headerName })
      .first();
  }

  async getColumnIndexByHeader(headerName) {
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

  async getCellTextByHeader(searchValue, headerName) {
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

  async getLarAndParParsedValues(searchValue) {
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

  async openDetailsModalFromResultRow(searchValue) {
    const row = await this.getResultRow(searchValue);
    await expect(row).toBeVisible({ timeout: 90_000 });
    await row.click();
    await this.page.waitForTimeout(2000);
  }

  // async openCustomersTabInModal() {
  //   const customersTab = this.page.getByText('Customers', { exact: true });
  //   await expect(customersTab).toBeVisible({ timeout: 30_000 });
  //   await customersTab.click();
  //   await this.page.waitForTimeout(1500);
  // }

  async openCustomersTabInModal() {
  const modal = this.page.locator('[role="dialog"]').last();

  const customersTab = modal
    .locator('span')
    .filter({ hasText: 'Customers' })
    .first();

  await expect(customersTab).toBeVisible({ timeout: 30_000 });
  await customersTab.click();

  await this.page.waitForTimeout(1500);
 }

  parseConsumptionMwhFromCardText(cardText) {
    const normalized = cardText.replace(/\s+/g, ' ').trim();
    const match = normalized.match(/Consumption\s+([\d,.]+)\s*MWh/i);

    if (!match) {
      return 0;
    }

    const value = Number(match[1].replace(/,/g, '').trim());
    return Number.isNaN(value) ? 0 : value;
  }

  getCustomerCardsInModal() {
    const modal = this.page.locator('[role="dialog"]').last();
    return modal.locator('div').filter({ hasText: 'Account Number' });
  }

  async sumConsumptionOnCurrentCustomerPage() {
    const cards = this.getCustomerCardsInModal();
    const count = await cards.count();

    let total = 0;

    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).innerText();
      total += this.parseConsumptionMwhFromCardText(text);
    }

    return total;
  }

  async getCustomerModalPagination() {
    const modal = this.page.locator('[role="dialog"]').last();
    const indicator = modal.getByText(/Page\s+\d+\s+of\s+\d+/i);

    await expect(indicator).toBeVisible({ timeout: 30_000 });

    const text = (await indicator.innerText()).trim();
    const match = text.match(/Page\s+(\d+)\s+of\s+(\d+)/i);

    if (!match) {
      throw new Error(`Unable to parse customer pagination text: "${text}"`);
    }

    return {
      current: Number(match[1]),
      last: Number(match[2])
    };
  }

  async goToNextCustomerModalPage() {
    const modal = this.page.locator('[role="dialog"]').last();
    const { current, last } = await this.getCustomerModalPagination();

    if (current >= last) {
      return;
    }

    const nextPageButton = modal.getByRole('button', { name: String(current + 1) });

    await expect(nextPageButton).toBeVisible({ timeout: 30_000 });
    await nextPageButton.click();

    await expect(async () => {
      const pagination = await this.getCustomerModalPagination();
      expect(pagination.current).toBe(current + 1);
    }).toPass({ timeout: 15_000 });

    await this.page.waitForTimeout(1000);
  }

  async getTotalCustomerConsumptionMwhFromModal() {
    let total = 0;
    const visitedPages = new Set();

    while (true) {
      const { current, last } = await this.getCustomerModalPagination();

      if (visitedPages.has(current)) {
        throw new Error(`Customer modal pagination loop detected on page ${current}`);
      }

      visitedPages.add(current);

      total += await this.sumConsumptionOnCurrentCustomerPage();

      if (current >= last) {
        break;
      }

      await this.goToNextCustomerModalPage();
    }

    return total;
  }
}

module.exports = { GridEnergyProfilePage };