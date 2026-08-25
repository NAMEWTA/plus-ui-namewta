import { expect, test, type Page, type Route } from '@playwright/test';
import * as CryptoJSModule from 'crypto-js';

const adminWebUrl = process.env.ADMIN_WEB_URL ?? 'http://127.0.0.1:4173';
const clientWebUrl = process.env.CLIENT_WEB_URL ?? 'http://127.0.0.1:4174';
const adminClientId = 'e5cd7e4891bf95d1d19206ce24a7b32e';
const proofClientId = 'client-web-proof';
const clientTokenKey = `namewta:client-web:${proofClientId}:access-token`;
const CryptoJS = ('default' in CryptoJSModule ? CryptoJSModule.default : CryptoJSModule) as typeof CryptoJSModule;

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

type AdminApiState = {
  getInfoRequests: number;
  getRoutersRequests: number;
  loginBody?: Record<string, unknown>;
  loginClientHeader: string;
  loginRequests: number;
  networkOrder: string[];
  unknownRequests: string[];
};

const createAdminState = (): AdminApiState => ({
  getInfoRequests: 0,
  getRoutersRequests: 0,
  loginClientHeader: '',
  loginRequests: 0,
  networkOrder: [],
  unknownRequests: []
});

const decryptAdminLoginBody = (postData: string): Record<string, unknown> => {
  const encrypted = postData.trim().startsWith('"') ? (JSON.parse(postData) as string) : postData;
  const key = CryptoJS.enc.Utf8.parse('07'.repeat(16));
  const text = CryptoJS.AES.decrypt(encrypted, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8);
  return JSON.parse(text) as Record<string, unknown>;
};

async function installAdminApi(page: Page, state: AdminApiState) {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    if (path === '/auth/client/context') {
      return fulfillJson(route, { code: 200, data: { clientEnabled: true, registerEnabled: false } });
    }
    if (path === '/auth/code') {
      return fulfillJson(route, { code: 200, data: { captchaEnabled: false } });
    }
    if (path === '/auth/login') {
      state.loginRequests += 1;
      state.networkOrder.push('login');
      state.loginClientHeader = request.headers()['clientid'] ?? '';
      state.loginBody = decryptAdminLoginBody(request.postData() ?? '');
      return fulfillJson(route, { code: 200, data: { access_token: 'admin-proof-token' } });
    }
    if (path === '/system/user/getInfo') {
      state.getInfoRequests += 1;
      state.networkOrder.push('getInfo');
      return fulfillJson(route, {
        code: 200,
        data: {
          user: { userId: 1, userName: 'admin-proof', nickName: 'Admin Proof', avatarUrl: '' },
          roles: ['admin-proof-role'],
          permissions: ['baseline:route:view']
        }
      });
    }
    if (path === '/system/menu/getRouters') {
      state.getRoutersRequests += 1;
      state.networkOrder.push('getRouters');
      return fulfillJson(route, { code: 200, data: [] });
    }
    if (path === '/resource/message/box') {
      return fulfillJson(route, { code: 200, data: { systemList: [], noticeList: [], workflowList: [] } });
    }
    if (path === '/resource/message/close') return fulfillJson(route, { code: 200, data: null });
    if (path === '/resource/message') return route.fulfill({ contentType: 'text/event-stream', body: '' });
    state.unknownRequests.push(`${request.method()} ${path}`);
    return fulfillJson(route, { code: 200, data: null, rows: [], total: 0 });
  });
}

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

test('admin-web and client-web complete isolated Client logins in one browser context', async ({ browser }) => {
  const context = await browser.newContext();
  const clientPage = await context.newPage();
  const adminPage = await context.newPage();
  const clientState = createState();
  const adminState = createAdminState();
  await installClientApi(clientPage, clientState);
  await installAdminApi(adminPage, adminState);
  await adminPage.addInitScript(() => {
    Object.defineProperty(globalThis.crypto, 'getRandomValues', {
      configurable: true,
      value: <T extends ArrayBufferView>(array: T): T => {
        new Uint8Array(array.buffer, array.byteOffset, array.byteLength).fill(7);
        return array;
      }
    });
  });

  await Promise.all([clientPage.goto(`${clientWebUrl}/login`), adminPage.goto(`${adminWebUrl}/login`)]);

  await expect(clientPage.locator('[data-app-shell="client-web"]')).toBeVisible();
  await expect(adminPage.locator('[data-app-shell="client-web"]')).toHaveCount(0);
  await expect(clientPage.getByRole('button', { name: '登录', exact: true })).toBeEnabled();
  await expect(adminPage.locator('.submit-button')).toBeEnabled();

  await clientPage.getByLabel('用户名').fill('client-user');
  await clientPage.getByLabel('密码').fill('client-password');
  await clientPage.getByRole('button', { name: '登录', exact: true }).click();
  await adminPage.locator('.submit-button').click();

  await expect(clientPage).toHaveURL(`${clientWebUrl}/demo`);
  await expect.poll(() => adminState.getRoutersRequests).toBe(1);
  expect(clientState.networkOrder).toEqual(['client-context', 'auth-code', 'login', 'demo-list']);
  expect(adminState.networkOrder).toEqual(['login', 'getInfo', 'getRouters']);
  expect(clientState.loginRequests).toBe(1);
  expect(adminState.loginRequests).toBe(1);
  expect(clientState.loginClientHeader).toBe(proofClientId);
  expect(clientState.loginBody?.clientId).toBe(proofClientId);
  expect(adminState.loginClientHeader).toBe(adminClientId);
  expect(adminState.loginBody?.clientId).toBe(adminClientId);

  expect(await adminPage.evaluate(() => localStorage.getItem('Admin-Token'))).toBe('admin-proof-token');
  expect(await adminPage.evaluate(key => localStorage.getItem(key), clientTokenKey)).toBeNull();
  expect(await adminPage.evaluate(key => sessionStorage.getItem(key), clientTokenKey)).toBeNull();
  expect(await clientPage.evaluate(key => sessionStorage.getItem(key), clientTokenKey)).toBe('client-proof-token');
  expect(await clientPage.evaluate(() => localStorage.getItem('Admin-Token'))).toBeNull();
  expect(await clientPage.evaluate(() => sessionStorage.getItem('Admin-Token'))).toBeNull();
  expect(clientState.unknownRequests).toEqual([]);
  expect(adminState.unknownRequests).toEqual([]);

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
