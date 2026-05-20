const { expect } = require('@playwright/test');

class PlannedOutagePage {
  constructor(page) {
    this.page = page;
  }

  async gotoNetworkDashboard() {
    await this.page.goto('/network-management/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });
  }

  async stayLoggedInIfPromptAppears() {
    const modal = this.page.getByText(/you have been dormant for too long/i);

    const stayLoggedInButton = this.page.getByRole('button', {
      name: /stay logged in/i
    });

    const modalVisible = await modal
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (modalVisible) {
      await expect(stayLoggedInButton).toBeVisible({
        timeout: 10000
      });

      await stayLoggedInButton.click({
        force: true
      });

      await expect(modal).not.toBeVisible({
        timeout: 10000
      });
    }
  }

  async openPlannedOutageSchedule() {
    await this.page.getByText('Outage & Availability', { exact: true }).click();

    await this.page
      .getByText('Planned Outage Schedule', { exact: true })
      .click();

    await expect(this.page).toHaveURL(
      /\/network-management\/planned-outage/i,
      {
        timeout: 120000
      }
    );

    await expect(
      this.page
        .locator('app-planned-outage-main')
        .getByText('Planned Outage Schedule', { exact: true })
    ).toBeVisible({
      timeout: 60000
    });
  }

  async createNewOutage() {
    const createButton = this.page.getByRole('button', {
      name: /create new outage/i
    });

    await expect(createButton).toBeVisible({
      timeout: 60000
    });

    await createButton.click();

    await expect(
      this.page.getByText(
        /Is this Planned Outage Captured in the Load Forecast/i
      )
    ).toBeVisible({
      timeout: 60000
    });

    await this.page.getByRole('button', { name: /^yes$/i }).click();

    await expect(
      this.page.getByText(/Select Asset Type/i)
    ).toBeVisible({
      timeout: 60000
    });
  }

  async clickRadio(label) {
    const radio = this.page.getByRole('radio', {
      name: new RegExp(`^${label}$`, 'i')
    });

    await expect(radio).toBeVisible({
      timeout: 60000
    });

    await radio.check({
      force: true
    });
  }

  async selectNativeDropdownByHeading(headingText, optionText) {
  const heading = this.page.getByRole('heading', {
    name: new RegExp(`^${headingText}$`, 'i')
  });

  await expect(heading).toBeVisible({ timeout: 60000 });

  const container = heading.locator('xpath=..');
  const combo = container.getByRole('combobox').first();

  await expect(combo).toBeVisible({ timeout: 60000 });
  await expect(combo).toBeEnabled({ timeout: 60000 });

  await combo.selectOption({ label: optionText });
}

  async fillTextboxByHeading(headingText, value) {
    const section = this.page
      .locator('div')
      .filter({
        has: this.page.getByRole('heading', {
          name: new RegExp(headingText, 'i')
        })
      })
      .first();

    const textbox = section.getByRole('textbox').first();

    await expect(textbox).toBeVisible({
      timeout: 60000
    });

    await expect(textbox).toBeEnabled({
      timeout: 60000
    });

    await textbox.fill(value);
  }

  async fillNumberByHeading(headingText, value) {
    const section = this.page
      .locator('div')
      .filter({
        has: this.page.getByRole('heading', {
          name: new RegExp(headingText, 'i')
        })
      })
      .first();

    const spinbutton = section.getByRole('spinbutton').first();

    await expect(spinbutton).toBeVisible({
      timeout: 60000
    });

    await expect(spinbutton).toBeEnabled({
      timeout: 60000
    });

    await spinbutton.fill(value);
  }

  async selectAutocompleteByHeading(headingText, optionText) {
    const section = this.page
      .locator('div')
      .filter({
        has: this.page.getByRole('heading', {
          name: new RegExp(headingText, 'i')
        })
      })
      .first();

    const textbox = section.getByRole('textbox').first();

    await expect(textbox).toBeVisible({
      timeout: 60000
    });

    await expect(textbox).toBeEnabled({
      timeout: 60000
    });

    await textbox.click({
      force: true
    });

    await textbox.fill(optionText);

    const option = this.page
      .locator(
        '.cdk-overlay-container, .mat-mdc-autocomplete-panel, .mat-autocomplete-panel, body'
      )
      .getByText(optionText, {
        exact: false
      })
      .first();

    await expect(option).toBeVisible({
      timeout: 60000
    });

    await option.click({
      force: true
    });
  }

  async setDateTime(labelText, dateValue, hourValue, minuteValue) {
    const field = this.page
      .locator('div')
      .filter({
        hasText: new RegExp(labelText, 'i')
      })
      .getByRole('textbox')
      .first();

    await expect(field).toBeVisible({
      timeout: 60000
    });

    await field.click({
      force: true
    });

    await field.fill(`${dateValue} ${hourValue}:${minuteValue}`);

    await field.press('Tab');
  }

  async fillPlannedOutageForm(data) {
    await this.clickRadio(data.assetType);

    await this.clickRadio(data.owner);

    await this.selectNativeDropdownByHeading(
      'Select type of Outage',
      data.outageType
    );

    await this.selectNativeDropdownByHeading(
      'Select Outage Indication',
      data.outageIndication
    );

    await this.fillTextboxByHeading(
      'Reason for Outage',
      data.reason
    );

    await this.selectNativeDropdownByHeading(
      'Affected Business Unit',
      data.businessUnit
    );

    await this.selectNativeDropdownByHeading(
      'Undertaking Office',
      data.undertakingOffice
    );

    await this.selectNativeDropdownByHeading(
      'Affected DT',
      data.affectedDT
    );

    await expect(
      this.page.getByText(/Connected Feeder/i)
    ).toBeVisible({
      timeout: 60000
    });

    await this.selectAutocompleteByHeading(
      'Permit Holder Name',
      data.permitHolderName
    );

    await expect(
      this.page
        .getByDisplayValue(data.permitHolderEmail)
        .or(
          this.page.getByText(data.permitHolderEmail)
        )
    ).toBeVisible({
      timeout: 60000
    });

    await expect(
      this.page
        .getByDisplayValue(data.designation)
        .or(
          this.page.getByText(data.designation)
        )
    ).toBeVisible({
      timeout: 60000
    });

    await this.setDateTime(
      'Outage Start',
      data.startDate,
      data.startHour,
      data.startMinute
    );

    await this.setDateTime(
      'Outage End',
      data.endDate,
      data.endHour,
      data.endMinute
    );

    await expect(
      this.page
        .getByDisplayValue(data.expectedDuration)
        .or(
          this.page.getByText(data.expectedDuration)
        )
    ).toBeVisible({
      timeout: 60000
    });

    await this.selectNativeDropdownByHeading(
      'Weather',
      data.weather
    );

    await this.fillNumberByHeading(
      'Load Loss',
      data.loadLoss
    );

    await expect(
      this.page.getByText(
        /Number of Customers Affected/i
      )
    ).toBeVisible({
      timeout: 60000
    });

    await this.fillTextboxByHeading(
      'Message to Affected Customers',
      data.message
    );
  }

  async submitOutageExpectingPendingMessage(data) {
    await this.page.getByRole('button', {
      name: /^submit$/i
    }).click();

    await expect(
      this.page.getByText(
        data.pendingOutageMessage,
        {
          exact: false
        }
      )
    ).toBeVisible({
      timeout: 60000
    });
  }

  async submitOutageExpectingSuccess() {
    await this.page.getByRole('button', {
      name: /^submit$/i
    }).click();

    await expect(
      this.page.getByText(
        /success|created|submitted/i
      )
    ).toBeVisible({
      timeout: 60000
    });
  }

  getRecordRow(data) {
    return this.page
      .locator('table tbody tr, .table tbody tr')
      .filter({
        hasText: data.reason
      })
      .filter({
        hasText: data.affectedDT
      })
      .filter({
        hasText: data.permitHolderName
      })
      .first();
  }

  async assertRecordStatus(data, status) {
    const row = this.getRecordRow(data);

    await expect(row).toBeVisible({
      timeout: 60000
    });

    await expect(row).toContainText(status, {
      timeout: 60000
    });
  }

  async openRowMenu(data) {
    const row = this.getRecordRow(data);

    await expect(row).toBeVisible({
      timeout: 60000
    });

    const menuButton = row
      .locator('button, svg, .mat-icon, i')
      .last();

    await menuButton.click({
      force: true
    });
  }

  async chooseRowAction(data, actionName) {
    await this.openRowMenu(data);

    const action = this.page
      .locator(
        '.cdk-overlay-container, .dropdown-menu, body'
      )
      .getByText(actionName, {
        exact: true
      })
      .first();

    await expect(action).toBeVisible({
      timeout: 60000
    });

    await action.click({
      force: true
    });
  }

  async recommend(data) {
    await this.chooseRowAction(data, 'Recommend');

    await this.assertRecordStatus(
      data,
      'Recommended'
    );
  }

  async approveToFLApproved(data) {
    await this.chooseRowAction(data, 'Approve');

    await this.assertRecordStatus(
      data,
      'FL Approved'
    );
  }

  async approveToSLApprovedAndMove(data) {
    await this.chooseRowAction(data, 'Approve');

    await expect(
      this.getRecordRow(data)
    ).toBeHidden({
      timeout: 60000
    });

    await this.openHQRegionalControlCenter();

    const row = this.getRecordRow(data);

    await expect(row).toBeVisible({
      timeout: 60000
    });

    await expect(row).toContainText(
      /SL Approved/i,
      {
        timeout: 60000
      }
    );
  }

  async openHQRegionalControlCenter() {
    await this.page
      .getByText(
        'HQ/Regional Control Center',
        {
          exact: true
        }
      )
      .click();

    await expect(
      this.page.getByText(
        /HQ\/Regional Control Center/i
      )
    ).toBeVisible({
      timeout: 60000
    });
  }

  async confirmOutage(data) {
    await this.chooseRowAction(
      data,
      'Confirm'
    );

    await expect(
      this.page.getByText(/confirm/i)
    ).toBeVisible({
      timeout: 60000
    });

    const reasonBox = this.page
      .locator('textarea, input')
      .last();

    await reasonBox.fill(
      'Outage is confirmed'
    );

    await this.page
      .getByRole('button', {
        name: /done/i
      })
      .click();

    await expect(
      this.page.getByText(
        /confirmed|success/i
      )
    ).toBeVisible({
      timeout: 60000
    });
  }

  async openPendingSGCard() {
    await this.page
      .getByText(
        'Pending SG Card',
        {
          exact: true
        }
      )
      .click();

    await expect(
      this.page.getByText(
        /Pending SG Card/i
      )
    ).toBeVisible({
      timeout: 60000
    });
  }

  async confirmSGCard(data) {
    await this.openPendingSGCard();

    await this.chooseRowAction(
      data,
      'Confirm SG Card'
    );

    await expect(
      this.page.getByText(
        /confirmed|success/i
      )
    ).toBeVisible({
      timeout: 60000
    });
  }
}

module.exports = {
  PlannedOutagePage
};