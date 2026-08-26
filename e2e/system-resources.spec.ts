import { expect, test, type Page, type Route } from '@playwright/test';

const adminUrl = process.env.ADMIN_WEB_URL ?? 'http://127.0.0.1:4173';
const clientUrl = process.env.CLIENT_WEB_URL ?? 'http://127.0.0.1:4174';
const adminClientId = 'e5cd7e4891bf95d1d19206ce24a7b32e';

const menus = [
  { path: '/system-dict', name: 'SystemDictProof', component: 'system/dict/index', meta: { title: '字典管理' } },
  { path: '/system-config', name: 'SystemConfigProof', component: 'system/config/index', meta: { title: '参数设置' } },
  { path: '/system-notice', name: 'SystemNoticeProof', component: 'system/notice/index', meta: { title: '通知公告' } },
  { path: '/system-oss', name: 'SystemOssProof', component: 'system/oss/index', meta: { title: '文件管理' } },
  {
    path: '/system-oss-config',
    name: 'SystemOssConfigProof',
    component: 'system/oss/config',
    meta: { title: 'OSS配置' }
  }
];

type State = {
  configFailure: boolean;
  requests: Array<{ clientId: string; method: string; path: string }>;
  unknown: string[];
};

const json = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });

async function installApi(page: Page, state: State, permissions: string[]) {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    const method = request.method();
    if (path === '/system/user/getInfo') {
      return json(route, {
        code: 200,
        data: {
          user: { userId: 11, userName: 'resource-admin', nickName: 'Resource Admin', avatarUrl: '' },
          roles: ['operator'],
          permissions
        }
      });
    }
    if (path === '/system/menu/getRouters') return json(route, { code: 200, data: menus });
    if (path === '/resource/message/box') {
      state.requests.push({ clientId: request.headers()['clientid'] ?? '', method, path });
      return json(route, {
        code: 200,
        data: {
          systemList: [{ messageId: 1, title: '系统资源消息', message: '已完成' }],
          noticeList: [],
          workflowList: []
        }
      });
    }
    if (path === '/resource/message') return route.fulfill({ contentType: 'text/event-stream', body: '' });
    if (path.startsWith('/system/dict/data/type/')) return json(route, { code: 200, data: [] });

    const resourcePaths = new Set([
      '/system/dict/type/list',
      '/system/config/list',
      '/system/notice/list',
      '/resource/oss/list',
      '/resource/oss/7/download-url',
      '/resource/oss/config/list',
      '/system/config/configKey/sys.oss.previewListResource'
    ]);
    if (resourcePaths.has(path)) {
      state.requests.push({ clientId: request.headers()['clientid'] ?? '', method, path });
      if (path === '/system/config/list') {
        if (state.configFailure) return json(route, { code: 500, msg: '当前 Client 参数查询失败' });
        return json(route, {
          code: 200,
          data: {
            rows: [{ configId: 1, configName: '站点名称', configKey: 'site.name', configValue: 'NAMEWTA' }],
            total: 1
          }
        });
      }
      if (path === '/system/dict/type/list') {
        return json(route, {
          code: 200,
          data: { rows: [{ dictId: 1, dictName: '资源状态', dictType: 'resource_status' }], total: 1 }
        });
      }
      if (path === '/system/notice/list') return json(route, { code: 200, data: { rows: [], total: 0 } });
      if (path === '/resource/oss/config/list') return json(route, { code: 200, data: { rows: [], total: 0 } });
      if (path === '/system/config/configKey/sys.oss.previewListResource')
        return json(route, { code: 200, data: 'true' });
      if (path === '/resource/oss/list') {
        return json(route, {
          code: 200,
          data: {
            rows: [
              {
                ossId: 7,
                fileName: 'proof.txt',
                originalName: 'proof.txt',
                fileSuffix: '.txt',
                url: '',
                service: 'proof'
              }
            ],
            total: 1
          }
        });
      }
      if (path === '/resource/oss/7/download-url') {
        return json(route, {
          code: 200,
          data: { url: 'javascript:alert(1)', fileName: 'proof.txt', expiresAt: 'later' }
        });
      }
    }

    state.unknown.push(`${method} ${path}`);
    return json(route, { code: 200, data: null });
  });
}

test('admin selects resource manifests and keeps message/config/dict/OSS requests Client scoped', async ({ page }) => {
  const state: State = { configFailure: false, requests: [], unknown: [] };
  await installApi(page, state, ['system:dict:list', 'system:config:list', 'system:oss:list', 'system:oss:download']);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'system-resource-proof'));

  await page.goto(`${adminUrl}/system-dict`);
  await expect(page.getByRole('heading', { name: '字典管理' })).toBeVisible();
  await expect(page.getByText('资源状态', { exact: true })).toBeVisible();

  await page.goto(`${adminUrl}/system-config`);
  await expect(page.getByRole('heading', { name: '参数列表' })).toBeVisible();
  await expect(page.getByText('site.name', { exact: true })).toBeVisible();

  await page.goto(`${adminUrl}/system-oss`);
  await expect(page.getByRole('heading', { name: '文件列表' })).toBeVisible();
  await expect(page.getByText('proof.txt', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: '下载' }).click();
  await expect(page.getByText('资源地址不可用', { exact: true })).toBeVisible();

  expect(state.requests.every(item => item.clientId === adminClientId)).toBe(true);
  expect(state.requests.map(item => `${item.method} ${item.path}`)).toEqual(
    expect.arrayContaining([
      'GET /resource/message/box',
      'GET /system/dict/type/list',
      'GET /system/config/list',
      'GET /resource/oss/list',
      'GET /resource/oss/7/download-url'
    ])
  );
  expect(state.unknown).toEqual([]);
});

test('resource permission denial hides mutations and a Client query failure never invents fallback data', async ({
  page
}) => {
  const state: State = { configFailure: true, requests: [], unknown: [] };
  await installApi(page, state, ['system:config:list']);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'system-resource-denied'));

  await page.goto(`${adminUrl}/system-config`);
  await expect(page.getByText('当前 Client 参数查询失败', { exact: true })).toBeVisible();
  await expect(page.getByText('site.name', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '新增' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '导出' })).toHaveCount(0);
  expect(state.requests.filter(item => item.path === '/system/config/list')).toHaveLength(1);
  expect(state.unknown).toEqual([]);
});

test('client-web diagnoses the unselected system resource key', async ({ page }) => {
  await page.goto(`${clientUrl}/diagnostic?domain=system-admin&key=system%2Foss%2Findex`);

  await expect(page.getByRole('heading', { name: '当前 App 未选择该能力' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('[missing-component-key]');
  await expect(page.getByRole('alert')).toContainText('app=client-web domain=system-admin key=system/oss/index');
});
