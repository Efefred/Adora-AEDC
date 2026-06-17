const { expect } = require('@playwright/test');

const { NodeEnergyAnalysisHelper } = require('../utils/nodeEnergyAnalysisHelper');

class GridEnergyProfilePage {
  constructor(page) {
    this.page = page;
    this.currentMode = null;

    this.pageHeader = page.getByRole('main').getByText('Energy Management', { exact: true });

    this.distributionTransformerTab = page.getByText('Distribution Transformer', { exact: true });
    this.outgoing33KvFeedersTab = page.getByText('Outgoing 33KV Feeders', { exact: true });
    this.outgoing11KvFeedersTab = page.getByText('Outgoing 11KV Feeders', { exact: true });

    this.dtSearchInput = page
      .locator(
        'input[placeholder="Search by DT name or number"], input[title="Search by DT name or number"], input[name="searchText"]'
      )
      .first();

    this.feeder33SearchInput = page
      .locator(
        'input[placeholder="Search by Feeder 33 name or number"], input[title="Search by Feeder 33 name or number"], input[name="searchText"]'
      )
      .first();

    this.feeder11SearchInput = page
      .locator(
        'input[placeholder="Search by Feeder 11 name or number"], input[title="Search by Feeder 11 name or number"], input[name="searchText"]'
      )
      .first();

    this.downloadAvailabilityButton = page
      .locator('button, a, div, span')
      .filter({ hasText: /^Download Availability$/ })
      .first();

    this.downloadReportButton = page
      .locator('button, a, div, span')
      .filter({ hasText: /^Download Report$/ })
      .first();
  }

  escapeRegex(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  normalizeText(text) {
    return String(text).replace(/\s+/g, ' ').trim();
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/network-management\/grid-energy-profile/i);
    await expect(this.pageHeader).toBeVisible({ timeout: 90_000 });
  }

  async waitForGridToStabilize() {
    await this.page.waitForLoadState('networkidle', { timeout: 90_000 }).catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  async openDistributionTransformerTab() {
    this.currentMode = 'dt';

    await expect(this.distributionTransformerTab).toBeVisible({ timeout: 90_000 });
    await this.distributionTransformerTab.click();

    await expect(this.dtSearchInput).toBeVisible({ timeout: 90_000 });

    await this.waitForGridToStabilize();
  }

  async openOutgoing33KvFeedersTab() {
    this.currentMode = 'f33';

    await expect(this.outgoing33KvFeedersTab).toBeVisible({ timeout: 90_000 });
    await this.outgoing33KvFeedersTab.click();

    await expect(this.feeder33SearchInput).toBeVisible({ timeout: 90_000 });

    await this.waitForGridToStabilize();
  }

  async openOutgoing11KvFeedersTab() {
    this.currentMode = 'f11';

    await expect(this.outgoing11KvFeedersTab).toBeVisible({ timeout: 90_000 });
    await this.outgoing11KvFeedersTab.click();

    await expect(this.feeder11SearchInput).toBeVisible({ timeout: 90_000 });

    await this.waitForGridToStabilize();
  }

  async clickDownloadAvailability() {
    await expect(this.downloadAvailabilityButton).toBeVisible({ timeout: 90_000 });
    await this.downloadAvailabilityButton.scrollIntoViewIfNeeded();
    await this.downloadAvailabilityButton.click();
  }

  async clickDownloadReport() {
    await expect(this.downloadReportButton).toBeVisible({ timeout: 90_000 });
    await this.downloadReportButton.scrollIntoViewIfNeeded();
    await this.downloadReportButton.click();
  }


async downloadFile(triggerMethod) {
  return await triggerMethod();
}

async downloadAvailabilityReport() {
  await this.waitForGridToStabilize();

  const [download] = await Promise.all([
    this.page.waitForEvent('download', { timeout: 120_000 }),
    this.clickDownloadAvailability()
  ]);

  const fileName = download.suggestedFilename();

  const fs = require('fs');

  const downloadDir = 'test-results/downloads';

  fs.mkdirSync(downloadDir, { recursive: true });

  const filePath = `${downloadDir}/${fileName}`;

  await download.saveAs(filePath);

  return {
    fileName,
    filePath
  };
}

async downloadNodeEnergyReport(mode) {
  return await this.downloadFile(
    async () => {
      const responsePromise = this.page.waitForResponse(
        async (response) => {
          const url = response.url().toLowerCase();

          return (
            response.status() === 200 &&
            (
              url.includes('report') ||
              url.includes('monthly') ||
              url.includes('feeder') ||
              url.includes('transformer') ||
              url.includes('xlsx') ||
              url.includes('excel')
            )
          );
        },
        { timeout: 120_000 }
      );

      await this.clickDownloadReport();

      const response = await responsePromise;

      const buffer = await response.body();

      const fs = require('fs');

      const fileName = `report-${mode}-${Date.now()}.xlsx`;
      const downloadDir = 'test-results/downloads';

      fs.mkdirSync(downloadDir, { recursive: true });

      const filePath = `${downloadDir}/${fileName}`;

      fs.writeFileSync(filePath, buffer);

      return {
        fileName,
        filePath
      };
    },
    `report-${mode}`
  );
}


  getSearchInput(mode) {
    if (mode === 'dt') return this.dtSearchInput;
    if (mode === 'f33') return this.feeder33SearchInput;
    if (mode === 'f11') return this.feeder11SearchInput;

    throw new Error(`Unsupported mode: ${mode}`);
  }

  getPrimaryIdentifierHeader(mode) {
    if (mode === 'dt') return 'METER NUMBER';
    if (mode === 'f33') return 'FEEDER NUMBER';
    if (mode === 'f11') return 'FEEDER NUMBER';

    throw new Error(`Unsupported mode: ${mode}`);
  }

  _getAutocompletePanel() {
    return this.page
      .locator(
        [
          '.mat-mdc-autocomplete-panel',
          '.mat-autocomplete-panel',
          '[role="listbox"]',
          '.cdk-overlay-pane .autocomplete-wrapper',
          '.autocomplete-wrapper'
        ].join(', ')
      )
      .filter({ has: this.page.locator('*') })
      .last();
  }

  _getOptionInPanel(searchValue) {
    const escaped = this.escapeRegex(searchValue);

    return this._getAutocompletePanel()
      .locator(
        [
          '.mat-mdc-option',
          'mat-option',
          '.mat-option',
          '[role="option"]',
          '.autocomplete-option',
          '.option',
          'div',
          'span'
        ].join(', ')
      )
      .filter({ hasText: new RegExp(escaped) })
      .first();
  }

  async _clearInput(input) {
    await input.waitFor({ state: 'visible', timeout: 90_000 });

    await input.click({ clickCount: 3 });

    await input.press('Delete').catch(() => {});
    await input.press('Backspace').catch(() => {});

    await expect(input).toHaveValue('', { timeout: 10_000 }).catch(async () => {
      await input.fill('');
    });
  }

  async _tryGetPanelAndOption(searchValue, timeout = 4000) {
    const panel = this._getAutocompletePanel();

    const panelVisible = await panel.isVisible().catch(() => false);

    if (!panelVisible) {
      await panel.waitFor({ state: 'visible', timeout }).catch(() => {});
    }

    const visibleNow = await panel.isVisible().catch(() => false);

    if (!visibleNow) {
      return {
        panel: null,
        option: null,
        panelVisible: false,
        optionVisible: false
      };
    }

    const option = this._getOptionInPanel(searchValue);

    const optionVisible = await option.isVisible().catch(() => false);

    return {
      panel,
      option,
      panelVisible: true,
      optionVisible
    };
  }

  getAllDataRows() {
    return this.page
      .locator('tbody tr, [role="row"]')
      .filter({ has: this.page.locator('td, [role="cell"]') });
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
      const text = this.normalizeText(await headers.nth(i).innerText());

      if (text === headerName) {
        return i;
      }
    }

    throw new Error(`Column header not found: ${headerName}`);
  }

  async getResultRowByIdentifier(mode, searchValue) {
    const headerName = this.getPrimaryIdentifierHeader(mode);

    const columnIndex = await this.getColumnIndexByHeader(headerName);

    const rows = this.getAllDataRows();

    const rowCount = await rows.count();

    const expected = this.normalizeText(searchValue);

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);

      const cells = row.locator('td, [role="cell"]');

      const cellCount = await cells.count();

      if (columnIndex >= cellCount) continue;

      const actual = this.normalizeText(await cells.nth(columnIndex).innerText());

      if (actual === expected) {
        await expect(row).toBeVisible({ timeout: 90_000 });

        return row;
      }
    }

    throw new Error(
      `No result row found for "${searchValue}" under "${headerName}" in mode "${mode}".`
    );
  }

  async _isResultRowVisible(mode, searchValue) {
    try {
      const rows = this.getAllDataRows();

      const rowCount = await rows.count();

      if (rowCount === 1) {
        return await rows.first().isVisible();
      }

      const row = await this.getResultRowByIdentifier(mode, searchValue);

      return await row.isVisible();
    } catch {
      return false;
    }
  }

  async _selectUsingPanel(option) {
    await option.scrollIntoViewIfNeeded();

    try {
      await option.click({ force: true });
    } catch {
      await option.evaluate((el) => {
        el.dispatchEvent(
          new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
          })
        );

        el.dispatchEvent(
          new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window
          })
        );

        el.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          })
        );
      });
    }
  }

  async _selectUsingKeyboard(input) {
    await input.press('ArrowDown').catch(() => {});
    await this.page.waitForTimeout(300);
    await input.press('Enter').catch(() => {});
  }

  async _commitAutocompleteSelection(mode, input, searchValue) {
    const firstTry = await this._tryGetPanelAndOption(searchValue);

    if (firstTry.panelVisible && firstTry.optionVisible) {
      await this._selectUsingPanel(firstTry.option);
    } else {
      await this._selectUsingKeyboard(input);
    }

    await this.page.waitForTimeout(800);

    await this.waitForGridToStabilize();

    if (await this._isResultRowVisible(mode, searchValue)) {
      return;
    }

    await this._clearInput(input);

    await input.type(searchValue, { delay: 120 });

    await expect(input).toHaveValue(searchValue, { timeout: 15_000 });

    const secondTry = await this._tryGetPanelAndOption(searchValue);

    if (secondTry.panelVisible && secondTry.optionVisible) {
      await this._selectUsingPanel(secondTry.option);
    } else {
      await this._selectUsingKeyboard(input);
      await input.press('Tab').catch(() => {});
    }

    await this.page.waitForTimeout(800);

    await this.waitForGridToStabilize();
  }

  async searchWithDropdown(mode, searchValue) {
    this.currentMode = mode;

    const input = this.getSearchInput(mode);

    await input.waitFor({ state: 'visible', timeout: 90_000 });

    await input.click();

    await this._clearInput(input);

    await input.type(searchValue, { delay: 120 });

    await expect(input).toHaveValue(searchValue, { timeout: 15_000 });

    await this._commitAutocompleteSelection(mode, input, searchValue);

    const matchedRow = await this.getResultRow(searchValue);

    await expect(matchedRow).toBeVisible({ timeout: 90_000 });
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

  async getResultRow(searchValue) {
    const rows = this.getAllDataRows();

    const rowCount = await rows.count();

    if (rowCount === 1) {
      const row = rows.first();

      await expect(row).toBeVisible({ timeout: 90_000 });

      return row;
    }

    if (!this.currentMode) {
      throw new Error('Current mode is not set before attempting to resolve result row.');
    }

    return await this.getResultRowByIdentifier(this.currentMode, searchValue);
  }

  async getCellTextByHeader(searchValue, headerName) {
    const row = await this.getResultRow(searchValue);

    await expect(row).toBeVisible({ timeout: 90_000 });

    const columnIndex = await this.getColumnIndexByHeader(headerName);

    const oneBasedColIndex = String(columnIndex + 1);

    const ariaCell = row
      .locator(
        `td[aria-colindex="${oneBasedColIndex}"], [role="cell"][aria-colindex="${oneBasedColIndex}"]`
      )
      .first();

    if (await ariaCell.count()) {
      return this.normalizeText(await ariaCell.innerText());
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

    return this.normalizeText(await cells.nth(columnIndex).innerText());
  }

  async getBandValues() {
  const text = this.normalizeText(
    await this.page.locator('body').innerText()
  );

  const bandValues = {};

  const matches = [
    ...text.matchAll(/Band\s+([A-D])\s*(\d+)/gi)
  ];

  for (const match of matches) {
    bandValues[`Band ${match[1].toUpperCase()}`] = match[2];
  }

  if (Object.keys(bandValues).length === 0) {
    throw new Error(
      `Unable to parse band values from page text: "${text}"`
    );
  }

  return bandValues;
}

  async getActiveBand() {
    const bandValues = await this.getBandValues();

    const activeBands = Object.entries(bandValues)
      .filter(([, value]) => this.normalizeText(value) === '1')
      .map(([bandName]) => bandName);

    if (activeBands.length !== 1) {
      throw new Error(
        `Expected exactly one active band with value 1, but found: ${JSON.stringify(bandValues)}`
      );
    }

    return activeBands[0];
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
  }

  async openCustomersTabInModal() {
    const modal = this.page.locator('[role="dialog"]').last();

    const customersTab = modal
      .locator('span')
      .filter({ hasText: 'Customers' })
      .first();

    await expect(customersTab).toBeVisible({ timeout: 30_000 });

    await customersTab.click();
  }

  parseConsumptionMwhFromCardText(cardText) {
    const normalized = cardText.replace(/\s+/g, ' ').trim();

    const match = normalized.match(/Consumption\s+([\d,.]+)\s*MWh/i);

    if (!match) return 0;

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

    const text = this.normalizeText(await indicator.innerText());

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

    if (current >= last) return;

    const nextPageButton = modal.getByRole('button', {
      name: String(current + 1)
    });

    await expect(nextPageButton).toBeVisible({ timeout: 30_000 });

    await nextPageButton.click();

    await expect(async () => {
      const pagination = await this.getCustomerModalPagination();

      expect(pagination.current).toBe(current + 1);
    }).toPass({ timeout: 15_000 });
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

      if (current >= last) break;

      await this.goToNextCustomerModalPage();
    }

    return total;
  }
}

module.exports = { GridEnergyProfilePage };