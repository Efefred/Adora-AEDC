const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;

    this.usernameInput = page.getByRole('textbox', { name: 'Email Address' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  // async open(loginPath = '/login') {
  //   await this.page.goto(loginPath);
  //   await expect(this.page).toHaveURL(/\/login/);
  //   await expect(this.loginButton).toBeVisible();
  // }
  
   async open(loginPath = '/login') {
    await this.page.goto(loginPath, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await expect(this.page).toHaveURL(/\/login/i, { timeout: 30_000 });

    try {
      await expect(this.loginButton).toBeVisible({ timeout: 20_000 });
    } catch {
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });
      await expect(this.page).toHaveURL(/\/login/i, { timeout: 30_000 });
      await expect(this.loginButton).toBeVisible({ timeout: 20_000 });
    }
  }  

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async submit() {
    await this.loginButton.click();
  }

  async submitEmpty() {
    await this.submit();
  }

  async attemptLogin(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submit();
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    await this.submit();

    await this.page.waitForURL(
      /\/process-login|\/global-landing-page|\/network-management\/dashboard/i,
      { timeout: 60000 }
    );

    await this.page.waitForURL(
      /\/global-landing-page|\/network-management\/dashboard/i,
      { timeout: 90000 }
    );
  }
}

module.exports = { LoginPage };