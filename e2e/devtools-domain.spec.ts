import { expect, test, type Page, type Route } from '@playwright/test';

const adminUrl = process.env.ADMIN_WEB_URL ?? 'http://127.0.0.1:4173';
const clientUrl = process.env.CLIENT_WEB_URL ?? 'http://127.0.0.1:4174';
const json = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
const menus = [
  { path: '/tool-gen', name: 'GeneratorProof', component: 'tool/gen/index', meta: { title: '代码生成' } },
  {
    path: '/tool/gen-edit/index/:tableId',
    name: 'GeneratorEditProof',
    component: 'tool/gen-edit/index',
    hidden: true,
    meta: { title: '修改生成配置' }
  }
];

type ApiState = { downloadMode: 'valid' | 'invalid'; downloadRequests: number; unknown: string[] };

async function installApi(page: Page, state: ApiState) {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    if (path === '/system/user/getInfo')
      return json(route, {
        code: 200,
        data: {
          user: { userId: 1, userName: 'developer', nickName: 'Developer', avatarUrl: '' },
          roles: ['developer'],
          permissions: [
            'tool:gen:list',
            'tool:gen:query',
            'tool:gen:code',
            'tool:gen:import',
            'tool:gen:edit',
            'tool:gen:remove',
            'tool:gen:preview'
          ]
        }
      });
    if (path === '/system/menu/getRouters') return json(route, { code: 200, data: menus });
    if (path === '/tool/gen/getDataNames') return json(route, { code: 200, data: ['master'] });
    if (path === '/tool/gen/list')
      return json(route, {
        code: 200,
        data: {
          rows: [
            {
              tableId: 41,
              dataName: 'master',
              tableName: 'proof_table',
              tableComment: '领域迁移验证',
              className: 'ProofTable',
              tplCategory: 'crud',
              frontendType: 'vue',
              packageName: 'org.proof',
              moduleName: 'proof',
              businessName: 'table',
              functionName: '验证',
              functionAuthor: 'specdev',
              tree: false,
              crud: true,
              updateTime: '2026-08-26 23:00:00'
            }
          ],
          total: 1
        }
      });
    if (path === '/tool/gen/preview/41')
      return json(route, { code: 200, data: { 'vm/java/domain.java.ftl': 'public class ProofTable {}' } });
    if (path === '/tool/gen/batchGenCode' && request.method() === 'GET') {
      state.downloadRequests += 1;
      if (state.downloadMode === 'invalid') return json(route, { code: 500, msg: '<b>模板生成失败</b>\u0000secret' });
      return route.fulfill({
        contentType: 'application/zip',
        body: Buffer.from([0x50, 0x4b, 0x05, 0x06, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      });
    }
    if (path === '/resource/message/box')
      return json(route, { code: 200, data: { systemList: [], noticeList: [], workflowList: [] } });
    if (path === '/resource/message/close') return json(route, { code: 200, data: null });
    if (path === '/resource/message') return route.fulfill({ contentType: 'text/event-stream', body: '' });
    state.unknown.push(request.method() + ' ' + path);
    return route.abort('failed');
  });
}

test('admin previews generated source, downloads a valid ZIP and rejects an error payload', async ({ page }) => {
  const state: ApiState = { downloadMode: 'valid', downloadRequests: 0, unknown: [] };
  const downloads: string[] = [];
  page.on('download', download => downloads.push(download.suggestedFilename()));
  await installApi(page, state);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'devtools-proof'));
  await page.goto(`${adminUrl}/tool-gen`);

  const row = page.locator('.devtools-generator-page .el-table__body tr').filter({ hasText: 'proof_table' });
  await expect(row).toBeVisible();
  await row.locator('button').nth(0).click();
  await expect(page.getByRole('dialog', { name: '代码预览' })).toBeVisible();
  await expect(page.getByTestId('generator-preview-source')).toContainText('public class ProofTable {}');
  await page.getByRole('dialog', { name: '代码预览' }).getByRole('button', { name: 'Close' }).click();

  await row.locator('button').nth(3).click();
  await expect.poll(() => downloads).toEqual(['ruoyi.zip']);

  state.downloadMode = 'invalid';
  await row.locator('button').nth(3).click();
  await expect(page.getByText('模板生成失败 secret', { exact: true })).toBeVisible();
  await expect.poll(() => downloads).toEqual(['ruoyi.zip']);
  expect(state.downloadRequests).toBe(2);
  expect(state.unknown).toEqual([]);
});

test('client-web keeps devtools unselected', async ({ page }) => {
  await page.goto(`${clientUrl}/diagnostic?domain=devtools&key=tool%2Fgen%2Findex`);
  await expect(page.getByRole('heading', { name: '当前 App 未选择该能力' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('app=client-web domain=devtools key=tool/gen/index');
});
