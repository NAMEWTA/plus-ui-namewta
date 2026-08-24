import { expect, test } from '@playwright/test';

const contextEndpoint = '**/prod-api/auth/client/context';

test('malformed client context keeps every login action disabled', async ({ page }) => {
  let codeRequests = 0;
  await page.route(contextEndpoint, route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, data: { clientEnabled: 'true', registerEnabled: true } })
    })
  );
  await page.route('**/prod-api/auth/code', route => {
    codeRequests += 1;
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ code: 200, data: {} }) });
  });

  await page.goto('/login');

  await expect(page.locator('.submit-button')).toBeDisabled();
  await expect(page.locator('.social-actions button')).toHaveCount(5);
  for (const button of await page.locator('.social-actions button').all()) {
    await expect(button).toBeDisabled();
  }
  await expect(page.locator('a[href="/register"]')).toHaveCount(0);
  expect(codeRequests).toBe(0);
});

test('exact boolean client context enables login and registration', async ({ page }) => {
  await page.route(contextEndpoint, route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, data: { clientEnabled: true, registerEnabled: true } })
    })
  );
  await page.route('**/prod-api/auth/code', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, data: { captchaEnabled: false } })
    })
  );

  await page.goto('/login');

  await expect(page.locator('.submit-button')).toBeEnabled();
  await expect(page.locator('a[href="/register"]')).toBeVisible();
});
