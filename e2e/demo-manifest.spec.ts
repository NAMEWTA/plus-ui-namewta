import { expect, test, type Page, type Route } from '@playwright/test';

type ApiState = {
  unknownRequests: string[];
};

const json = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });

async function installApi(page: Page, state: ApiState) {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    if (path === '/auth/client/context')
      return json(route, { code: 200, data: { clientEnabled: true, registerEnabled: true } });
    if (path === '/auth/code') return json(route, { code: 200, data: { captchaEnabled: false } });
    if (path === '/auth/login') return json(route, { code: 200, data: { access_token: 'demo-manifest-token' } });
    if (path === '/system/user/getInfo')
      return json(route, {
        code: 200,
        data: {
          user: { userId: 1, userName: 'demo-user', nickName: 'Demo User', avatarUrl: '' },
          roles: ['demo-role'],
          permissions: ['demo:demo:list', 'demo:tree:list']
        }
      });
    if (path === '/system/menu/getRouters')
      return json(route, {
        code: 200,
        data: [
          {
            path: '/demo',
            name: 'DemoMenu',
            component: 'Layout',
            redirect: 'noRedirect',
            alwaysShow: true,
            meta: { title: '演示管理', icon: 'dashboard', noCache: false },
            children: [
              {
                path: 'demo',
                name: 'Demo',
                component: 'demo/demo/index',
                meta: { title: '测试单', icon: 'dashboard', noCache: false }
              },
              {
                path: 'tree',
                name: 'Tree',
                component: 'demo/tree/index',
                meta: { title: '测试树', icon: 'tree-table', noCache: false }
              }
            ]
          }
        ]
      });
    if (path === '/demo/demo/list')
      return json(route, {
        code: 200,
        data: {
          rows: [{ id: 1, deptId: 10, userId: 20, orderNum: 1, testKey: 'manifest-key', value: 'pilot' }],
          total: 1
        }
      });
    if (path === '/demo/tree/list')
      return json(route, {
        code: 200,
        data: [{ id: 1, parentId: 0, deptId: 10, userId: 20, treeName: 'manifest-root', children: [] }]
      });
    if (path === '/resource/message/box')
      return json(route, { code: 200, data: { systemList: [], noticeList: [], workflowList: [] } });
    if (path === '/resource/message/close') return json(route, { code: 200, data: null });
    if (path === '/resource/message') return route.fulfill({ contentType: 'text/event-stream', body: '' });
    state.unknownRequests.push(`${request.method()} ${path}`);
    return json(route, { code: 200, data: null });
  });
}

test('stable demo manifest keys render both migrated web-domain pages', async ({ page }) => {
  const state: ApiState = { unknownRequests: [] };
  await installApi(page, state);

  await page.goto('/login?redirect=%2Fdemo%2Fdemo');
  await expect(page.locator('.submit-button')).toBeEnabled();
  await page.locator('.submit-button').click();

  await expect(page).toHaveURL(/\/demo\/demo$/);
  await expect(page.getByRole('heading', { name: '测试单列表' })).toBeVisible();
  await expect(page.getByText('manifest-key', { exact: true })).toBeVisible();

  await page.goto('/demo/tree');
  await expect(page).toHaveURL(/\/demo\/tree$/);
  await expect(page.getByRole('heading', { name: '测试树列表' })).toBeVisible();
  await expect(page.getByText('manifest-root', { exact: true })).toBeVisible();
  expect(state.unknownRequests).toEqual([]);
});
