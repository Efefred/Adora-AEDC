const { expect } = require('@playwright/test');

class OutageAvailabilityPage {
  constructor(page) {
    this.page = page;

    this.outageAndAvailabilityMenu = page.getByText('Outage & Availability', { exact: true });
    this.unplannedOutageScheduleMenu = page.getByText('Unplanned Outage Schedule', { exact: true });

    this.pageHeader = page.getByText('Real Time Outage', { exact: true });

    this.hqRegionalControlCenterTab = page.getByText('HQ/Regional Control Center', { exact: true });
    this.confirmedOutagesTab = page.getByText('Confirmed Outages', { exact: true });
    this.patrolOutagesTab = page.getByText('Patrol Outages', { exact: true });
    this.suspendedOutagesTab = page.getByText('Suspended Outages', { exact: true });
    this.cancelledOutagesTab = page.getByText('Cancelled Outages', { exact: true });
    this.resolvedOutagesTab = page.getByText('Resolved Outages', { exact: true });
    this.archivedOutagesTab = page.getByText('Archived Outages', { exact: true });

    this.downloadReportButton = page.locator('app-download-button-new button.btn-red').first();
  }

  async openOutageAndAvailability() {
    await expect(this.outageAndAvailabilityMenu).toBeVisible({ timeout: 90_000 });
    await this.outageAndAvailabilityMenu.click();

    await expect(this.page).toHaveURL(/\/network-management\/dashboard/i, {
      timeout: 90_000
    });
  }

  async openUnplannedOutageSchedule() {
    await expect(this.unplannedOutageScheduleMenu).toBeVisible({ timeout: 90_000 });
    await this.unplannedOutageScheduleMenu.click();

    await expect(this.page).toHaveURL(/\/network-management\/outage/i, {
      timeout: 90_000
    });

    await expect(this.pageHeader).toBeVisible({ timeout: 90_000 });
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/network-management\/outage/i, {
      timeout: 90_000
    });

    await expect(this.pageHeader).toBeVisible({ timeout: 90_000 });
  }

  getTabByName(tabName) {
    return this.page.getByText(tabName, { exact: true });
  }

  async openTab(tabName) {
    const tab = this.getTabByName(tabName);

    await expect(tab).toBeVisible({ timeout: 90_000 });
    await tab.click();
    await expect(tab).toBeVisible({ timeout: 90_000 });
  }

  async openHqRegionalControlCenterTab() {
    await this.openTab('HQ/Regional Control Center');
  }

  async openConfirmedOutagesTab() {
    await this.openTab('Confirmed Outages');
  }

  async openPatrolOutagesTab() {
    await this.openTab('Patrol Outages');
  }

  async openSuspendedOutagesTab() {
    await this.openTab('Suspended Outages');
  }

  async openCancelledOutagesTab() {
    await this.openTab('Cancelled Outages');
  }

  async openResolvedOutagesTab() {
    await this.openTab('Resolved Outages');
  }

  async openArchivedOutagesTab() {
    await this.openTab('Archived Outages');
  }

  async waitForOutageGridToStabilize() {
    await this.page.waitForLoadState('networkidle', { timeout: 90_000 }).catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  async clickDownloadReport() {
    await expect(this.downloadReportButton).toBeVisible({ timeout: 90_000 });
    await this.downloadReportButton.scrollIntoViewIfNeeded();
    await this.downloadReportButton.click();
  }

  isOutageExcelDocumentResponse(res) {
    const url = res.url().toLowerCase();
    const headers = res.headers();

    const contentType =
      (headers['content-type'] || headers['Content-Type'] || '').toLowerCase();

    const disposition =
      (headers['content-disposition'] || headers['Content-Disposition'] || '').toLowerCase();

    return (
      res.status() === 200 &&
      (
        url.includes('unplannedoutages_') ||
        url.endsWith('.xlsx') ||
        disposition.includes('.xlsx') ||
        contentType.includes('spreadsheetml') ||
        contentType.includes('application/octet-stream')
      )
    );
  }

  // async downloadUnplannedOutageReport() {
  //   await this.waitForOutageGridToStabilize();

  //   const [response] = await Promise.all([
  //     this.page.waitForResponse(
  //       (res) => this.isOutageExcelDocumentResponse(res),
  //       { timeout: 120_000 }
  //     ),
  //     this.clickDownloadReport()
  //   ]);

  //   const buffer = await response.body();

  //   return {
  //     buffer,
  //     headers: response.headers(),
  //     url: response.url(),
  //     status: response.status()
  //   };
  // }

        async downloadUnplannedOutageReport() {
  // wait for page to fully settle (CRITICAL)
  await this.waitForOutageGridToStabilize();

  const [download] = await Promise.all([
    this.page.waitForEvent('download', { timeout: 120_000 }),
    this.clickDownloadReport()
  ]);

  const fileName = download.suggestedFilename();
  const downloadDir = 'test-results/downloads';

  await this.page.waitForTimeout(2000); // allow file to finalize

  await download.saveAs(`${downloadDir}/${fileName}`);

  return {
    fileName,
    filePath: `${downloadDir}/${fileName}`
  };
 }

}

module.exports = { OutageAvailabilityPage };