import { expect, test, type Page, type Route } from '@playwright/test';

const adminUrl = process.env.ADMIN_WEB_URL ?? 'http://127.0.0.1:4173';
const adminClientId = 'e5cd7e4891bf95d1d19206ce24a7b32e';

type AdminState = {
  context: unknown;
  loginClientId: string;
  logoutRequests: number;
  networkOrder: string[];
  permissions: string[];
  roles: string[];
  routes: unknown[];
  unknownRequests: string[];
};

const adminState = (overrides: Partial<AdminState> = {}): AdminState => ({
  context: { clientEnabled: true, registerEnabled: true },
  loginClientId: '',
  logoutRequests: 0,
  networkOrder: [],
  permissions: ['system:user:list'],
  roles: ['operator'],
  routes: [],
  unknownRequests: [],
  ...overrides
});

const fulfillJson = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });

async function installAdminApi(page: Page, state: AdminState, messageBoxCode = 200) {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    if (path === '/auth/client/context') {
      state.networkOrder.push('clientContext');
      return fulfillJson(route, { code: 200, data: state.context });
    }
    if (path === '/auth/code') {
      state.networkOrder.push('code');
      return fulfillJson(route, { code: 200, data: { captchaEnabled: false } });
    }
    if (path === '/auth/login') {
      state.networkOrder.push('login');
      state.loginClientId = request.headers()['clientid'] ?? '';
      return fulfillJson(route, { code: 200, data: { access_token: 'admin-proof-token' } });
    }
    if (path === '/system/user/getInfo') {
      state.networkOrder.push('getInfo');
      return fulfillJson(route, {
        code: 200,
        data: {
          user: { userId: 1, userName: 'admin-proof', nickName: 'Admin Proof', avatarUrl: '' },
          roles: state.roles,
          permissions: state.permissions
        }
      });
    }
    if (path === '/system/menu/getRouters') {
      state.networkOrder.push('getRouters');
      return fulfillJson(route, { code: 200, data: state.routes });
    }
    if (path === '/auth/logout') {
      state.logoutRequests += 1;
      return fulfillJson(route, { code: 200, data: null });
    }
    if (path === '/resource/message/box') {
      return fulfillJson(route, {
        code: messageBoxCode,
        data: { systemList: [], noticeList: [], workflowList: [] }
      });
    }
    if (path === '/resource/message/close') return fulfillJson(route, { code: 200, data: null });
    if (path === '/resource/message') return route.fulfill({ contentType: 'text/event-stream', body: '' });
    if (path === '/system/dept/treeselect') return fulfillJson(route, { code: 200, data: [] });
    if (path === '/system/user/list') return fulfillJson(route, { code: 200, rows: [], total: 0 });
    state.unknownRequests.push(`${request.method()} ${path}`);
    return fulfillJson(route, { code: 200, data: null, rows: [], total: 0 });
  });
}

test('invalid Client context reaches terminal fail-close before code or login', async ({ page }) => {
  const state = adminState({ context: { clientEnabled: 'true', registerEnabled: true } });
  await installAdminApi(page, state);

  await page.goto('/login');

  await expect(page.getByText('客户端认证配置不可用，无法登录', { exact: true })).toBeVisible();
  await expect(page.locator('.submit-button')).toBeDisabled();
  expect(state.networkOrder).toEqual(['clientContext']);
  expect(state.unknownRequests).toEqual([]);
});

test('dynamic recovery uses server menu order and exposes a true no-facade typo diagnostic', async ({ page }) => {
  const state = adminState({
    routes: [
      {
        path: '/manifest-typo',
        name: 'ManifestTypo',
        component: 'system/user/not-a-physical-facade',
        meta: { title: 'Manifest typo' }
      }
    ]
  });
  await installAdminApi(page, state);

  await page.goto('/login?redirect=%2Fmanifest-typo');
  await expect(page.locator('.submit-button')).toBeEnabled();
  await page.locator('.submit-button').click();

  await expect(page).toHaveURL(/\/manifest-typo$/);
  await expect(page.getByTestId('manifest-route-diagnostic')).toContainText(
    'app=admin-web domain=system key=system/user/not-a-physical-facade'
  );
  expect(state.networkOrder).toEqual(['clientContext', 'code', 'login', 'getInfo', 'getRouters']);
  expect(state.loginClientId).toBe(adminClientId);
  expect(state.unknownRequests).toEqual([]);
});

test('permission wildcard allows controls while an unrelated permission fails closed', async ({ browser }) => {
  const route = {
    path: '/permission-matrix',
    name: 'PermissionMatrix',
    component: 'system/user/index',
    meta: { title: 'Permission matrix' }
  };
  const context = await browser.newContext();
  const wildcardPage = await context.newPage();
  const deniedPage = await context.newPage();
  const wildcard = adminState({ permissions: ['*:*:*'], routes: [route] });
  const denied = adminState({ permissions: ['system:user:list'], routes: [route] });
  await installAdminApi(wildcardPage, wildcard);
  await installAdminApi(deniedPage, denied);
  await wildcardPage.addInitScript(() => localStorage.setItem('Admin-Token', 'wildcard-token'));
  await deniedPage.addInitScript(() => localStorage.setItem('Admin-Token', 'denied-token'));

  await Promise.all([
    wildcardPage.goto(`${adminUrl}/permission-matrix`),
    deniedPage.goto(`${adminUrl}/permission-matrix`)
  ]);
  await expect(wildcardPage.getByRole('heading', { name: '用户列表' })).toBeVisible();
  await expect(deniedPage.getByRole('heading', { name: '用户列表' })).toBeVisible();
  await expect(wildcardPage.getByRole('button', { name: '新增' })).toBeVisible();
  await expect(deniedPage.getByRole('button', { name: '新增' })).toHaveCount(0);
  await context.close();
});

test('a protected 401 presents one recovery and performs one logout', async ({ page }) => {
  const state = adminState();
  await installAdminApi(page, state, 401);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'expired-token'));

  await page.goto('/index');
  await expect(page.getByRole('dialog', { name: '系统提示' })).toBeVisible();
  await page.getByRole('button', { name: '重新登录' }).click();
  await expect(page).toHaveURL(/\/login\?redirect=/);

  expect(state.logoutRequests).toBe(1);
  await expect(page.getByRole('dialog', { name: '系统提示' })).toHaveCount(0);
});
