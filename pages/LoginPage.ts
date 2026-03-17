import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.usernameInput = page.getByRole('textbox', { name: 'Email Address' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async open(loginPath: string = '/login') {
    await this.page.goto(loginPath);
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.loginButton).toBeVisible();
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

  async attemptLogin(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submit();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    await this.submit();

    await this.page.waitForURL(
      /\/process-login|\/global-landing-page|\/network-management\/dashboard/i,
      { timeout: 60_000 }
    );

    await this.page.waitForURL(
      /\/global-landing-page|\/network-management\/dashboard/i,
      { timeout: 90_000 }
    );
  }
}