const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const testData = require('../fixtures/testData.json');

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

    await login.open(
      testData.login.urlPath || '/login'
    );
  });

  test.describe('Negative Cases', () => {

    for (const { title, username, password } of negativeCases) {

      test(`Negative: ${title} stays on /login`, async ({ page }) => {

        const login = new LoginPage(page);

        if (title === 'empty credentials') {
          await login.submitEmpty();
        } else {
          await login.attemptLogin(username, password);
        }

        await expect(page).toHaveURL(/login/i, {
          timeout: 10000
        });
      });
    }
  });

  test('Positive: valid login navigates away from /login', async ({ page }) => {

    const login = new LoginPage(page);

    await login.login(
      testData.login.username,
      testData.login.password
    );

    await expect(page).not.toHaveURL(/login/i, {
      timeout: 30000
    });
  });

});