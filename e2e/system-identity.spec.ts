import { expect, test, type Page, type Route } from '@playwright/test';

const adminUrl = process.env.ADMIN_WEB_URL ?? 'http://127.0.0.1:4173';
const clientUrl = process.env.CLIENT_WEB_URL ?? 'http://127.0.0.1:4174';
const adminClientId = 'e5cd7e4891bf95d1d19206ce24a7b32e';

const routes = [
  { path: '/system-user', name: 'SystemUserProof', component: 'system/user/index', meta: { title: '用户管理' } },
  { path: '/system-role', name: 'SystemRoleProof', component: 'system/role/index', meta: { title: '角色管理' } },
  { path: '/system-menu', name: 'SystemMenuProof', component: 'system/menu/index', meta: { title: '菜单管理' } }
];

type AdminState = {
  failUserList: boolean;
  governanceRequests: Array<{ clientId: string; method: string; path: string }>;
  unknownRequests: string[];
};

const json = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });

async function installAdminApi(page: Page, state: AdminState) {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    const method = request.method();
    if (path === '/system/user/getInfo') {
      return json(route, {
        code: 200,
        data: {
          user: { userId: 7, userName: 'governance-reader', nickName: 'Governance Reader', avatarUrl: '' },
          roles: ['operator'],
          permissions: ['system:user:list', 'system:role:list', 'system:menu:list']
        }
      });
    }
    if (path === '/system/menu/getRouters') return json(route, { code: 200, data: routes });
    if (path === '/resource/message/box') {
      return json(route, { code: 200, data: { systemList: [], noticeList: [], workflowList: [] } });
    }
    if (path === '/resource/message/close') return json(route, { code: 200, data: null });
    if (path === '/resource/message') return route.fulfill({ contentType: 'text/event-stream', body: '' });
    if (path.startsWith('/system/dict/data/type/')) return json(route, { code: 200, data: [] });

    const governancePaths = new Set([
      '/system/user/deptTree',
      '/system/user/list',
      '/system/userType/options',
      '/system/client/list',
      '/system/config/configKey/sys.user.initPassword'
    ]);
    if (governancePaths.has(path)) {
      state.governanceRequests.push({ clientId: request.headers()['clientid'] ?? '', method, path });
      if (path === '/system/user/list') {
        if (state.failUserList) return json(route, { code: 500, msg: '跨 Client 用户查询被拒绝' });
        return json(route, {
          code: 200,
          data: {
            rows: [{ userId: 42, userName: 'scoped-user', nickName: 'Scoped User', status: '0' }],
            total: 1
          }
        });
      }
      if (path === '/system/client/list') {
        return json(route, {
          code: 200,
          data: { rows: [{ id: 1, clientId: 'proof-client', clientKey: 'proof-client', status: '0' }], total: 1 }
        });
      }
      if (path === '/system/config/configKey/sys.user.initPassword') return json(route, { code: 200, data: '123456' });
      return json(route, { code: 200, data: [] });
    }

    state.unknownRequests.push(`${method} ${path}`);
    return json(route, { code: 200, data: null });
  });
}

test('admin selects system governance pages while read-only permissions fail closed', async ({ page }) => {
  const state: AdminState = { failUserList: false, governanceRequests: [], unknownRequests: [] };
  await installAdminApi(page, state);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'system-governance-proof'));

  await page.goto(`${adminUrl}/system-user`);
  await expect(page.getByRole('heading', { name: '用户列表' })).toBeVisible();
  await expect(page.getByText('scoped-user', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '新增' })).toHaveCount(0);

  await page.goto(`${adminUrl}/system-role`);
  await expect(page.getByRole('heading', { name: '角色列表' })).toBeVisible();
  await page.goto(`${adminUrl}/system-menu`);
  await expect(page.getByRole('heading', { name: '菜单列表' })).toBeVisible();

  expect(state.governanceRequests.length).toBeGreaterThanOrEqual(5);
  expect(state.governanceRequests.every(item => item.method === 'GET')).toBe(true);
  expect(state.governanceRequests.every(item => item.clientId === adminClientId)).toBe(true);
  expect(state.unknownRequests).toEqual([]);
});

test('a rejected Client-scoped user query stays visible and does not invent fallback rows', async ({ page }) => {
  const state: AdminState = { failUserList: true, governanceRequests: [], unknownRequests: [] };
  await installAdminApi(page, state);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'system-governance-failure'));

  await page.goto(`${adminUrl}/system-user`);

  await expect(page.getByText('跨 Client 用户查询被拒绝', { exact: true })).toBeVisible();
  await expect(page.getByText('scoped-user', { exact: true })).toHaveCount(0);
  expect(state.governanceRequests.filter(item => item.path === '/system/user/list')).toHaveLength(1);
  expect(state.unknownRequests).toEqual([]);
});

test('client-web visibly diagnoses the unselected system-admin capability', async ({ page }) => {
  await page.goto(`${clientUrl}/diagnostic?domain=system-admin&key=system%2Fuser%2Findex`);

  await expect(page.getByRole('heading', { name: '当前 App 未选择该能力' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('[missing-component-key]');
  await expect(page.getByRole('alert')).toContainText('app=client-web domain=system-admin key=system/user/index');
});
