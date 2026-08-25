import { constants, createDecipheriv, createPrivateKey, privateDecrypt } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test, type Page, type Request, type Route } from '@playwright/test';

const productionClientId = 'e5cd7e4891bf95d1d19206ce24a7b32e';
const productionEnv = readFileSync(new URL('../.env.production', import.meta.url), 'utf8');

type ClientContextMode = 'valid' | 'request-failure' | 'missing-fields';

type BaselineApiState = {
  authCodeRequests: number;
  clientContextMode: ClientContextMode;
  getInfoRequests: number;
  getRoutersRequests: number;
  loginRequests: number;
  logoutRequests: number;
  messageBoxCode?: number;
  networkOrder: string[];
  registerRequests: number;
  unknownRequests: string[];
};

const createApiState = (overrides: Partial<BaselineApiState> = {}): BaselineApiState => ({
  authCodeRequests: 0,
  clientContextMode: 'valid',
  getInfoRequests: 0,
  getRoutersRequests: 0,
  loginRequests: 0,
  logoutRequests: 0,
  networkOrder: [],
  registerRequests: 0,
  unknownRequests: [],
  ...overrides
});

const readProductionEnv = (name: string) => {
  const match = productionEnv.match(new RegExp(`^${name}\\s*=\\s*['"]?([^'"\\r\\n]+)['"]?\\s*$`, 'm'));
  if (!match?.[1]) {
    throw new Error(`Missing ${name} in .env.production`);
  }
  return match[1];
};

const productionPrivateKey = createPrivateKey({
  key: Buffer.from(readProductionEnv('VITE_APP_RSA_PRIVATE_KEY'), 'base64'),
  format: 'der',
  type: 'pkcs8'
});

const decryptLoginBody = (request: Request) => {
  const encryptedKey = request.headers()['encrypt-key'];
  const postData = request.postData();
  if (!encryptedKey || !postData) {
    throw new Error('Expected encrypted production login payload');
  }
  const encodedAesKey = privateDecrypt(
    { key: productionPrivateKey, padding: constants.RSA_PKCS1_PADDING },
    Buffer.from(encryptedKey, 'base64')
  ).toString();
  const aesKey = Buffer.from(encodedAesKey, 'base64');
  const decipher = createDecipheriv('aes-256-ecb', aesKey, null);
  const encryptedBody = postData.startsWith('"') ? (JSON.parse(postData) as string) : postData;
  const body = Buffer.concat([decipher.update(Buffer.from(encryptedBody, 'base64')), decipher.final()]).toString();
  return JSON.parse(body) as Record<string, unknown>;
};

const fulfillJson = (route: Route, body: unknown) =>
  route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(body)
  });

const installBaselineApi = async (page: Page, state: BaselineApiState) => {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    if (path === '/auth/client/context') {
      if (state.clientContextMode === 'request-failure') {
        return route.abort('failed');
      }
      const data =
        state.clientContextMode === 'missing-fields'
          ? { clientEnabled: true }
          : { clientEnabled: true, registerEnabled: true };
      return fulfillJson(route, { code: 200, data });
    }
    if (path === '/auth/code') {
      state.authCodeRequests += 1;
      return fulfillJson(route, { code: 200, data: { captchaEnabled: false } });
    }
    if (path === '/auth/login') {
      state.loginRequests += 1;
      state.networkOrder.push('login');
      expect(decryptLoginBody(request).clientId).toBe(productionClientId);
      expect(request.headers()['clientid']).toBe(productionClientId);
      return fulfillJson(route, { code: 200, data: { access_token: 'baseline-token' } });
    }
    if (path === '/auth/register') {
      state.registerRequests += 1;
      return fulfillJson(route, { code: 200, data: null });
    }
    if (path === '/auth/logout') {
      state.logoutRequests += 1;
      return fulfillJson(route, { code: 200, data: null });
    }
    if (path === '/system/user/getInfo') {
      state.getInfoRequests += 1;
      state.networkOrder.push('getInfo');
      return fulfillJson(route, {
        code: 200,
        data: {
          user: { userId: 1, userName: 'baseline-user', nickName: 'Baseline User', avatarUrl: '' },
          roles: ['baseline-role'],
          permissions: ['baseline:route:view']
        }
      });
    }
    if (path === '/system/menu/getRouters') {
      state.getRoutersRequests += 1;
      state.networkOrder.push('getRouters');
      return fulfillJson(route, {
        code: 200,
        data: [
          {
            path: '/baseline',
            name: 'BaselineMenu',
            component: 'Layout',
            redirect: 'noRedirect',
            alwaysShow: true,
            meta: { title: '迁移基线', icon: 'dashboard', noCache: false },
            children: [
              {
                path: 'route',
                name: 'BaselineRoute',
                component: 'index',
                meta: { title: '迁移基线路由', icon: 'dashboard', noCache: false }
              }
            ]
          }
        ]
      });
    }
    if (path === '/resource/message/box') {
      return fulfillJson(route, {
        code: state.messageBoxCode ?? 200,
        data: { systemList: [], noticeList: [], workflowList: [] }
      });
    }
    if (path === '/resource/message/close') {
      return fulfillJson(route, { code: 200, data: null });
    }
    if (path === '/resource/message') {
      return route.fulfill({ contentType: 'text/event-stream', body: '' });
    }
    state.unknownRequests.push(`${request.method()} ${path}`);
    return fulfillJson(route, { code: 200, data: null, rows: [], total: 0 });
  });
};

const expectAuthenticationRequestsBlocked = async (page: Page, state: BaselineApiState) => {
  await expect(page.locator('.submit-button')).toBeDisabled();
  expect(state.authCodeRequests).toBe(0);
  expect(state.loginRequests).toBe(0);
  expect(state.registerRequests).toBe(0);
  expect(state.unknownRequests).toEqual([]);
};

test('client context request failure keeps authentication fail-closed', async ({ page }) => {
  const state = createApiState({ clientContextMode: 'request-failure' });
  await installBaselineApi(page, state);

  await page.goto('/login');

  await expectAuthenticationRequestsBlocked(page, state);
});

test('client context missing a required field keeps authentication fail-closed', async ({ page }) => {
  const state = createApiState({ clientContextMode: 'missing-fields' });
  await installBaselineApi(page, state);

  await page.goto('/login');

  await expectAuthenticationRequestsBlocked(page, state);
});

test('login restores the redirected server-filtered dynamic route without a backend', async ({ page }) => {
  const state = createApiState();
  await installBaselineApi(page, state);

  await page.goto('/login?redirect=%2Fbaseline%2Froute');
  await expect(page.locator('.submit-button')).toBeEnabled();
  await page.locator('.submit-button').click();

  await expect(page).toHaveURL(/\/baseline\/route$/);
  await expect(page.getByRole('heading', { name: 'RuoYi-Vue-Plus 控制台' })).toBeVisible();
  await expect(page.getByText('迁移基线路由', { exact: true })).toBeVisible();

  expect(state.networkOrder).toEqual(['login', 'getInfo', 'getRouters']);
  expect(state.loginRequests).toBe(1);
  expect(state.getInfoRequests).toBe(1);
  expect(state.getRoutersRequests).toBe(1);
  expect(state.unknownRequests).toEqual([]);
});

test('an authenticated 401 logs out and preserves the protected route as redirect', async ({ page }) => {
  const state = createApiState({ messageBoxCode: 401 });
  await installBaselineApi(page, state);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'baseline-token'));

  await page.goto('/baseline/route');
  await expect(page.getByRole('dialog', { name: '系统提示' })).toBeVisible();
  await page.getByRole('button', { name: '重新登录' }).click();
  await expect(page).toHaveURL(/\/login\?redirect=/);

  const redirect = new URL(page.url()).searchParams.get('redirect');
  expect(redirect).toBe(encodeURIComponent('/baseline/route'));
  expect(state.logoutRequests).toBe(1);
  expect(state.unknownRequests).toEqual([]);
});
