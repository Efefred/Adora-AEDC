const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;

    this.usernameInput = page.getByPlaceholder(/username|email/i);
    this.passwordInput = page.getByPlaceholder(/password/i);
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async open(loginPath = '/login') {
    await this.page.goto(loginPath, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    });

    await expect(this.page).toHaveURL(/\/login/i, { timeout: 20_000 });

    // Wait for the actual form, not just the button
    await expect(this.usernameInput).toBeVisible({ timeout: 20_000 });
    await expect(this.passwordInput).toBeVisible({ timeout: 20_000 });
    await expect(this.loginButton).toBeVisible({ timeout: 20_000 });
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

module.exports = { LoginPage };