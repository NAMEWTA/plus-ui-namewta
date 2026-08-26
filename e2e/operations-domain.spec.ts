import { expect, test, type Page, type Route } from '@playwright/test';

const adminUrl = process.env.ADMIN_WEB_URL ?? 'http://127.0.0.1:4173';
const clientUrl = process.env.CLIENT_WEB_URL ?? 'http://127.0.0.1:4174';
const json = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
const menus = [
  { path: '/monitor-online', name: 'OnlineProof', component: 'monitor/online/index', meta: { title: '在线用户' } },
  { path: '/monitor-admin', name: 'MonitorAdminProof', component: 'monitor/admin/index', meta: { title: '服务监控' } },
  { path: '/monitor-snailjob', name: 'SnailJobProof', component: 'monitor/snailjob/index', meta: { title: '任务调度' } }
];

async function installApi(page: Page, permissions: string[], unknown: string[]) {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    if (path === '/system/user/getInfo')
      return json(route, {
        code: 200,
        data: {
          user: { userId: 1, userName: 'operator', nickName: 'Operator', avatarUrl: '' },
          roles: ['operator'],
          permissions
        }
      });
    if (path === '/system/menu/getRouters') return json(route, { code: 200, data: menus });
    if (path === '/system/dict/data/type/sys_device_type') return json(route, { code: 200, data: [] });
    if (path === '/monitor/online/list' && request.method() === 'GET')
      return json(route, {
        code: 200,
        data: {
          rows: [
            {
              tokenId: 'session-1',
              userName: 'operations-user',
              deptName: '运维部',
              ipaddr: '127.0.0.1',
              loginLocation: '本机',
              browser: 'Chromium',
              os: 'Linux',
              loginTime: Date.now()
            }
          ],
          total: 1
        }
      });
    if (path === '/monitor/online/session-1' && request.method() === 'DELETE')
      return json(route, { code: 200, data: null });
    if (path === '/resource/message/box')
      return json(route, { code: 200, data: { systemList: [], noticeList: [], workflowList: [] } });
    if (path === '/resource/message/close') return json(route, { code: 200, data: null });
    if (path === '/resource/message') return route.fulfill({ contentType: 'text/event-stream', body: '' });
    unknown.push(request.method() + ' ' + path);
    return route.abort('failed');
  });
}

test('admin selects operations, queries a real monitor seam and opens only an authorized safe URL', async ({
  page
}) => {
  const unknown: string[] = [];
  await installApi(page, ['monitor:online:list', 'monitor:online:forceLogout', 'monitor:admin:list'], unknown);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'operations-proof'));
  await page.goto(`${adminUrl}/monitor-online`);
  await expect(page.getByText('operations-user', { exact: true })).toBeVisible();
  await page
    .locator('.monitor-online-page .el-table__body tr')
    .filter({ hasText: 'operations-user' })
    .locator('button')
    .click();
  await page.getByRole('dialog', { name: '系统提示' }).getByRole('button', { name: '确定' }).click();
  await expect(page.getByText('删除成功', { exact: true })).toBeVisible();
  await page.goto(`${adminUrl}/monitor-admin`);
  await expect(page.locator('iframe')).toHaveAttribute('src', /(?:\/admin\/applications|\/applications)/);
  expect(unknown).toEqual([]);
});

test('permission denial renders no external frame and client keeps operations unselected', async ({ page }) => {
  const unknown: string[] = [];
  await installApi(page, [], unknown);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'operations-denied'));
  await page.goto(`${adminUrl}/monitor-snailjob`);
  await expect(page.getByRole('alert')).toContainText('无权访问运维入口');
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(unknown).toEqual([]);

  await page.goto(`${clientUrl}/diagnostic?domain=operations&key=monitor%2Fonline%2Findex`);
  await expect(page.getByRole('heading', { name: '当前 App 未选择该能力' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('app=client-web domain=operations key=monitor/online/index');
});
