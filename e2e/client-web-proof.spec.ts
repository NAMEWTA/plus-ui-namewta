import { expect, test, type Page, type Route } from '@playwright/test';

const adminWebUrl = process.env.ADMIN_WEB_URL ?? 'http://127.0.0.1:4173';
const clientWebUrl = process.env.CLIENT_WEB_URL ?? 'http://127.0.0.1:4174';
const proofClientId = 'client-web-proof';
const clientTokenKey = `namewta:client-web:${proofClientId}:access-token`;

type ClientApiState = {
  authCodeRequests: number;
  clientContextRequests: number;
  demoPageNumbers: string[];
  demoRequests: number;
  loginBody?: Record<string, unknown>;
  loginClientHeader: string;
  loginRequests: number;
  networkOrder: string[];
  unknownRequests: string[];
};

const createState = (): ClientApiState => ({
  authCodeRequests: 0,
  clientContextRequests: 0,
  demoPageNumbers: [],
  demoRequests: 0,
  loginClientHeader: '',
  loginRequests: 0,
  networkOrder: [],
  unknownRequests: []
});

const fulfillJson = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });

async function installClientApi(
  page: Page,
  state: ClientApiState,
  context: unknown = { clientEnabled: true, registerEnabled: false },
  captcha = false
) {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    if (path === '/auth/client/context') {
      state.clientContextRequests += 1;
      state.networkOrder.push('client-context');
      return fulfillJson(route, { code: 200, data: context });
    }
    if (path === '/auth/code') {
      state.authCodeRequests += 1;
      state.networkOrder.push('auth-code');
      return fulfillJson(route, {
        code: 200,
        data: captcha
          ? {
              captchaEnabled: true,
              img: 'R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
              uuid: `captcha-${state.authCodeRequests}`
            }
          : { captchaEnabled: false }
      });
    }
    if (path === '/auth/login') {
      state.loginRequests += 1;
      state.networkOrder.push('login');
      state.loginClientHeader = request.headers()['clientid'] ?? '';
      state.loginBody = request.postDataJSON() as Record<string, unknown>;
      return fulfillJson(route, { code: 200, data: { access_token: 'client-proof-token' } });
    }
    if (path === '/demo/demo/list') {
      state.demoRequests += 1;
      state.demoPageNumbers.push(new URL(request.url()).searchParams.get('pageNum') ?? '');
      state.networkOrder.push('demo-list');
      return fulfillJson(route, { code: 200, data: { rows: [], total: 11 } });
    }
    state.unknownRequests.push(`${request.method()} ${path}`);
    return fulfillJson(route, { code: 200, data: null });
  });
}

test('client-web logs in with one Client identity and an isolated session before loading demo', async ({ page }) => {
  const state = createState();
  await installClientApi(page, state, undefined, true);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'admin-session-must-survive'));

  await page.goto(`${clientWebUrl}/login`);
  await expect(page.locator('[data-app-shell="client-web"]')).toBeVisible();
  await expect(page.getByText('入口已就绪', { exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: '验证码图片' })).toBeVisible();
  await page.getByRole('button', { name: '刷新验证码' }).click();
  await expect.poll(() => state.authCodeRequests).toBe(2);
  await expect(page.getByText('入口已就绪', { exact: true })).toBeVisible();
  await page.getByLabel('用户名').fill('client-user');
  await page.getByLabel('密码').fill('client-password');
  await page.locator('input[name="code"]').fill('proof-code');
  await page.getByRole('button', { name: '登录', exact: true }).click();

  await expect(page).toHaveURL(`${clientWebUrl}/demo`);
  await expect(page.getByRole('heading', { name: '测试单列表' })).toBeVisible();
  expect(state.networkOrder).toEqual([
    'client-context',
    'auth-code',
    'client-context',
    'auth-code',
    'login',
    'demo-list'
  ]);
  expect(state.loginClientHeader).toBe(proofClientId);
  expect(state.loginBody?.clientId).toBe(proofClientId);
  expect(state.loginBody).toMatchObject({
    username: 'client-user',
    code: 'proof-code',
    uuid: 'captcha-2',
    grantType: 'password'
  });
  expect(await page.evaluate(key => sessionStorage.getItem(key), clientTokenKey)).toBe('client-proof-token');
  expect(await page.evaluate(() => sessionStorage.getItem('Admin-Token'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('Admin-Token'))).toBe('admin-session-must-survive');

  await page.getByRole('button', { name: '刷新列表' }).click();
  await expect.poll(() => state.demoRequests).toBe(2);
  await page.locator('.client-pagination .btn-next').click();
  await expect.poll(() => state.demoRequests).toBe(3);
  expect(state.demoPageNumbers).toEqual(['1', '1', '2']);

  await page.getByRole('link', { name: 'Namewta Client' }).click();
  await expect(page).toHaveURL(`${clientWebUrl}/login`);
  await expect.poll(() => state.clientContextRequests).toBe(3);
  expect(state.unknownRequests).toEqual([]);
});

test('malformed server Client context reaches a terminal fail-close state before auth requests', async ({ page }) => {
  const state = createState();
  await installClientApi(page, state, { clientEnabled: 'true', registerEnabled: false });

  await page.goto(`${clientWebUrl}/login`);

  await expect(page.getByRole('alert')).toHaveText('客户端认证配置不可用，无法登录');
  await expect(page.getByRole('button', { name: '登录', exact: true })).toBeDisabled();
  expect(state.clientContextRequests).toBe(1);
  expect(state.authCodeRequests).toBe(0);
  expect(state.loginRequests).toBe(0);
  expect(state.unknownRequests).toEqual([]);
});

test('client-web visibly diagnoses a component key from an unselected domain', async ({ page }) => {
  const state = createState();
  await installClientApi(page, state);

  await page.goto(`${clientWebUrl}/diagnostic?domain=workflow&key=workflow%2Ftask%2Findex`);

  await expect(page.getByRole('heading', { name: '当前 App 未选择该能力' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('[missing-component-key]');
  await expect(page.getByRole('alert')).toContainText('app=client-web domain=workflow key=workflow/task/index');
  expect(state.clientContextRequests).toBe(0);
  expect(state.unknownRequests).toEqual([]);
});

test('client-web shell and green client theme remain observable apart from admin-web', async ({ browser }) => {
  const context = await browser.newContext();
  const clientPage = await context.newPage();
  const adminPage = await context.newPage();
  const clientState = createState();
  await installClientApi(clientPage, clientState);
  await adminPage.route('**/prod-api/auth/client/context', route =>
    fulfillJson(route, { code: 200, data: { clientEnabled: true, registerEnabled: false } })
  );
  await adminPage.route('**/prod-api/auth/code', route =>
    fulfillJson(route, { code: 200, data: { captchaEnabled: false } })
  );

  await Promise.all([clientPage.goto(`${clientWebUrl}/login`), adminPage.goto(`${adminWebUrl}/login`)]);

  await expect(clientPage.locator('[data-app-shell="client-web"]')).toBeVisible();
  await expect(adminPage.locator('[data-app-shell="client-web"]')).toHaveCount(0);
  expect(
    await clientPage.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--client-accent').trim()
    )
  ).toBe('#087f5b');
  expect(
    await adminPage.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--client-accent').trim()
    )
  ).not.toBe('#087f5b');
  await context.close();
});
