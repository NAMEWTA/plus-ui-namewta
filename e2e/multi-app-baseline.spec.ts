import { expect, test, type Page, type Route } from '@playwright/test';

type BaselineApiState = {
  loginRequests: number;
  getInfoRequests: number;
  getRoutersRequests: number;
  logoutRequests: number;
  messageBoxCode?: number;
};

const fulfillJson = (route: Route, body: unknown) =>
  route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(body)
  });

const installBaselineApi = async (page: Page, state: BaselineApiState) => {
  await page.route('**/prod-api/**', route => {
    const path = new URL(route.request().url()).pathname.replace('/prod-api', '');
    if (path === '/auth/client/context') {
      return fulfillJson(route, { code: 200, data: { clientEnabled: true, registerEnabled: true } });
    }
    if (path === '/auth/code') {
      return fulfillJson(route, { code: 200, data: { captchaEnabled: false } });
    }
    if (path === '/auth/login') {
      state.loginRequests += 1;
      return fulfillJson(route, { code: 200, data: { access_token: 'baseline-token' } });
    }
    if (path === '/auth/logout') {
      state.logoutRequests += 1;
      return fulfillJson(route, { code: 200, data: null });
    }
    if (path === '/system/user/getInfo') {
      state.getInfoRequests += 1;
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
    if (path === '/resource/message') {
      return route.fulfill({ contentType: 'text/event-stream', body: '' });
    }
    return fulfillJson(route, { code: 200, data: null, rows: [], total: 0 });
  });
};

test('login restores the server-filtered dynamic route without a backend', async ({ page }) => {
  const state: BaselineApiState = {
    loginRequests: 0,
    getInfoRequests: 0,
    getRoutersRequests: 0,
    logoutRequests: 0
  };
  await installBaselineApi(page, state);

  await page.goto('/login');
  await expect(page.locator('.submit-button')).toBeEnabled();
  await page.locator('.submit-button').click();

  await expect(page.getByRole('heading', { name: 'RuoYi-Vue-Plus 控制台' })).toBeVisible();
  await expect(page.getByText('迁移基线路由', { exact: true })).toBeVisible();
  await page.getByText('迁移基线路由', { exact: true }).click();
  await expect(page).toHaveURL(/\/baseline\/route$/);
  await expect(page.getByRole('heading', { name: 'RuoYi-Vue-Plus 控制台' })).toBeVisible();

  expect(state.loginRequests).toBe(1);
  expect(state.getInfoRequests).toBe(1);
  expect(state.getRoutersRequests).toBe(1);
});

test('an authenticated 401 logs out and preserves the protected route as redirect', async ({ page }) => {
  const state: BaselineApiState = {
    loginRequests: 0,
    getInfoRequests: 0,
    getRoutersRequests: 0,
    logoutRequests: 0,
    messageBoxCode: 401
  };
  await installBaselineApi(page, state);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'baseline-token'));

  await page.goto('/baseline/route');
  await expect(page.getByRole('dialog', { name: '系统提示' })).toBeVisible();
  await page.getByRole('button', { name: '重新登录' }).click();
  await expect(page).toHaveURL(/\/login\?redirect=/);

  const redirect = new URL(page.url()).searchParams.get('redirect');
  expect(redirect).toBe(encodeURIComponent('/baseline/route'));
  expect(state.logoutRequests).toBe(1);
});
