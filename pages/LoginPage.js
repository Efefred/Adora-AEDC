const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;

    // Visible controls only
    this.usernameInput = page.getByRole('textbox', {
      name: 'Email Address'
    });

    this.passwordInput = page.getByRole('textbox', {
      name: 'Password'
    });

    this.loginButton = page.getByRole('button', {
      name: 'Login'
    });
  }

  async open(loginPath = '/login') {
    await this.page.goto(loginPath, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    });

    await expect(this.page).toHaveURL(/login/i, {
      timeout: 30_000
    });

    await expect(this.usernameInput).toBeVisible({
      timeout: 30_000
    });

    await expect(this.passwordInput).toBeVisible({
      timeout: 30_000
    });

    await expect(this.loginButton).toBeVisible({
      timeout: 30_000
    });
  }

  async login(username, password) {
    await this.usernameInput.fill(username ?? '');
    await this.passwordInput.fill(password ?? '');
    await this.loginButton.click();
  }

  async attemptLogin(username, password) {
    await this.login(username, password);
  }

  async submitEmpty() {
    await this.loginButton.click();
  }
}

module.exports = { LoginPage };