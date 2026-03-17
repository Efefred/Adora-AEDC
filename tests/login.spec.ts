import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import testData from '../fixtures/testData.json';
//import messages from '../fixtures/messages.json';

const negativeCases = [
  {
    title: 'empty credentials',
    username: '',
    password: ''
  },
  {
    title: 'invalid username',
    username: testData.login.invalidUsername,
    password: testData.login.password
  },
  {
    title: 'invalid password',
    username: testData.login.username,
    password: testData.login.invalidPassword
  },
  {
    title: 'invalid username and invalid password',
    username: testData.login.invalidUsername,
    password: testData.login.invalidPassword
  },
  {
    title: 'whitespace credentials',
    username: testData.login.whitespaceUsername,
    password: testData.login.whitespacePassword
  }
];

test.describe('Login (POM + Fixtures)', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.open(testData.login.urlPath);
  });

  test.describe('Negative Cases', () => {
    negativeCases.forEach(({ title, username, password }) => {
      test(`Negative: ${title} stays on /login`, async ({ page }) => {
        const login = new LoginPage(page);

        if (username === '' && password === '') {
          await login.submitEmpty();
        } else {
          await login.attemptLogin(username, password);
        }

        await expect(page).toHaveURL(/\/login/);
      });
    });
  });

  test.describe('Positive Case', () => {
    test('Positive: valid login navigates away from /login', async ({ page }) => {
      const login = new LoginPage(page);

      await login.login(testData.login.username, testData.login.password);

      await expect(page).not.toHaveURL(/\/login/);
      //await expect(page).toHaveURL(new RegExp(messages.login.successUrlFragment));
    });
  });
});