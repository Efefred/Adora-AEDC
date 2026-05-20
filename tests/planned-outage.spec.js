const { test } = require('@playwright/test');
const testData = require('../fixtures/testData.json');
const { PlannedOutagePage } = require('../pages/PlannedOutagePage');
const { getTomorrowOutageDateTime } = require('../utils/plannedOutageDateHelper');

test.describe('Planned Outage Full E2E Workflow', () => {
  test('Create planned outage and validate pending unresolved outage message', async ({ page }) => {
    test.setTimeout(240000);

    const plannedOutagePage = new PlannedOutagePage(page);

    const outageData = {
      ...testData.plannedOutage,
      ...getTomorrowOutageDateTime()
    };

    await plannedOutagePage.gotoNetworkDashboard();
    await plannedOutagePage.openPlannedOutageSchedule();
    await plannedOutagePage.createNewOutage();
    await plannedOutagePage.fillPlannedOutageForm(outageData);
    await plannedOutagePage.submitOutageExpectingPendingMessage(outageData);
  });
});