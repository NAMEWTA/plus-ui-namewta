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

type ApiState = {
  auxiliaryMode: 'success' | 'failure';
  downloadMode: 'valid' | 'invalid';
  downloadRequests: number;
  metadataClientIds: string[];
  unknown: string[];
  updates: Array<Record<string, unknown>>;
};
const createState = (): ApiState => ({
  auxiliaryMode: 'success',
  downloadMode: 'valid',
  downloadRequests: 0,
  metadataClientIds: [],
  unknown: [],
  updates: []
});

async function installApi(page: Page, state: ApiState) {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/prod-api', '');
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
    if (path === '/tool/gen/getDataNames')
      return json(
        route,
        state.auxiliaryMode === 'failure' ? { code: 500, msg: '数据源失败' } : { code: 200, data: ['master'] }
      );
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
    if (path === '/tool/gen/41' && request.method() === 'GET')
      return json(route, {
        code: 200,
        data: {
          info: {
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
            parentMenuId: 100,
            enableExport: true,
            enableStatus: false,
            statusField: '',
            enableUnique: false,
            uniqueFields: [],
            enableSort: false,
            sortField: '',
            treeRootValue: '0',
            treeAncestorsField: '',
            treeOrderField: '',
            columns: [],
            tree: false,
            crud: true
          },
          rows: [
            {
              columnId: 1,
              columnName: 'proof_id',
              columnComment: '主键',
              columnType: 'bigint',
              javaType: 'Long',
              javaField: 'proofId',
              isInsert: '1',
              isEdit: '0',
              isList: '1',
              isQuery: '1',
              queryType: 'EQ',
              isRequired: '1',
              htmlType: 'input',
              dictType: ''
            },
            {
              columnId: 2,
              columnName: 'parent_id',
              columnComment: '父级',
              columnType: 'bigint',
              javaType: 'Long',
              javaField: 'parentId',
              isInsert: '1',
              isEdit: '1',
              isList: '1',
              isQuery: '0',
              queryType: 'EQ',
              isRequired: '0',
              htmlType: 'input',
              dictType: ''
            },
            {
              columnId: 3,
              columnName: 'name',
              columnComment: '名称',
              columnType: 'varchar',
              javaType: 'String',
              javaField: 'name',
              isInsert: '1',
              isEdit: '1',
              isList: '1',
              isQuery: '1',
              queryType: 'LIKE',
              isRequired: '1',
              htmlType: 'select',
              dictType: 'sys_status'
            },
            {
              columnId: 4,
              columnName: 'ancestors',
              columnComment: '祖级',
              columnType: 'varchar',
              javaType: 'String',
              javaField: 'ancestors',
              isInsert: '1',
              isEdit: '1',
              isList: '0',
              isQuery: '0',
              queryType: 'EQ',
              isRequired: '0',
              htmlType: 'input',
              dictType: ''
            },
            {
              columnId: 5,
              columnName: 'sort_num',
              columnComment: '排序',
              columnType: 'int',
              javaType: 'Integer',
              javaField: 'sortNum',
              isInsert: '1',
              isEdit: '1',
              isList: '1',
              isQuery: '0',
              queryType: 'EQ',
              isRequired: '0',
              htmlType: 'inputNumber',
              dictType: ''
            }
          ]
        }
      });
    if (path === '/system/dict/type/optionselect') {
      state.metadataClientIds.push(`dict:${url.searchParams.get('clientId')}`);
      return json(
        route,
        state.auxiliaryMode === 'failure'
          ? { code: 500, msg: '字典失败' }
          : { code: 200, data: [{ dictName: '状态', dictType: 'sys_status' }] }
      );
    }
    if (path === '/system/menu/treeselect') {
      state.metadataClientIds.push(`menu:${url.searchParams.get('clientId')}`);
      return json(
        route,
        state.auxiliaryMode === 'failure'
          ? { code: 500, msg: '菜单失败' }
          : { code: 200, data: [{ id: 100, label: '系统工具' }] }
      );
    }
    if (path === '/tool/gen' && request.method() === 'PUT') {
      state.updates.push(request.postDataJSON() as Record<string, unknown>);
      return json(route, { code: 200, msg: '保存成功', data: null });
    }
    if (path === '/tool/gen/batchGenCode' && request.method() === 'GET') {
      state.downloadRequests += 1;
      if (state.downloadMode === 'invalid')
        return route.fulfill({ contentType: 'application/zip', body: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]) });
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
  const state = createState();
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
  await expect(page.getByText('下载文件出现错误，请联系管理员！', { exact: true })).toBeVisible();
  await expect.poll(() => downloads).toEqual(['ruoyi.zip']);
  expect(state.downloadRequests).toBe(2);
  expect(state.unknown).toEqual([]);
});

test('edit uses public metadata ports and preserves the complete generator payload', async ({ page }) => {
  const state = createState();
  await installApi(page, state);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'devtools-edit-proof'));
  await page.goto(`${adminUrl}/tool-gen`);
  const row = page.locator('.devtools-generator-page .el-table__body tr').filter({ hasText: 'proof_table' });
  await expect(row).toBeVisible();
  await row.locator('button').nth(1).click();

  await expect(page.getByRole('tab', { name: '字段信息' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('查询方式', { exact: true })).toBeVisible();
  await expect(page.getByText('必填', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: '生成信息' }).click();
  await expect(page.getByText('系统工具', { exact: true })).toBeVisible();
  await page.getByTestId('enable-unique').click();
  await page.getByTestId('unique-fields').click();
  await page.getByRole('option', { name: /name：名称/ }).click();
  await page.getByTestId('enable-sort').click();
  await page.getByTestId('sort-field').click();
  await page.getByRole('option', { name: /sort_num：排序/ }).click();
  await page.getByRole('radio', { name: '树表' }).click();
  await page.getByTestId('tree-root-value').locator('input').fill('ROOT');
  await page.getByTestId('tree-name').click();
  await page.getByRole('option', { name: /name：名称/ }).click();
  await page.getByTestId('tree-order').click();
  await page.getByRole('option', { name: /sort_num：排序/ }).click();
  await page.getByRole('button', { name: '提交', exact: true }).click();

  await expect.poll(() => state.updates.length).toBe(1);
  const update = state.updates[0] as any;
  expect(update).toMatchObject({
    tableId: 41,
    enableUnique: true,
    uniqueFields: ['name'],
    enableSort: true,
    sortField: 'sort_num',
    tplCategory: 'tree',
    treeRootValue: 'ROOT',
    treeName: 'name',
    treeOrderField: 'sort_num'
  });
  expect(update.params).toMatchObject({
    enableUnique: true,
    uniqueFields: ['name'],
    enableSort: true,
    sortField: 'sort_num',
    treeRootValue: 'ROOT',
    treeName: 'name',
    treeOrderField: 'sort_num'
  });
  expect(update.columns[0]).toMatchObject({ queryType: 'EQ', isRequired: '1' });
  expect(state.metadataClientIds).toEqual([
    'dict:e5cd7e4891bf95d1d19206ce24a7b32e',
    'menu:e5cd7e4891bf95d1d19206ce24a7b32e'
  ]);
  expect(state.unknown).toEqual([]);
});

test('auxiliary metadata failures do not hide primary list or edit data and can retry', async ({ page }) => {
  const state = createState();
  state.auxiliaryMode = 'failure';
  await installApi(page, state);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'devtools-retry-proof'));
  await page.goto(`${adminUrl}/tool-gen`);
  const row = page.locator('.devtools-generator-page .el-table__body tr').filter({ hasText: 'proof_table' });
  await expect(row).toBeVisible();
  await expect(page.getByText('数据源列表加载失败，表格仍可使用。')).toBeVisible();
  state.auxiliaryMode = 'success';
  await page.getByRole('button', { name: '重新加载' }).click();
  await expect(page.getByText('数据源列表加载失败，表格仍可使用。')).toHaveCount(0);

  state.auxiliaryMode = 'failure';
  await row.locator('button').nth(1).click();
  await expect(page.getByText('proof_id', { exact: true })).toBeVisible();
  await expect(page.getByText('字典类型加载失败，其他字段仍可编辑。')).toBeVisible();
  await page.getByRole('tab', { name: '生成信息' }).click();
  await expect(page.getByDisplayValue('org.proof')).toBeVisible();
  await expect(page.getByText('菜单目录加载失败，其他生成配置仍可编辑。')).toBeVisible();
  state.auxiliaryMode = 'success';
  await page.getByText('菜单目录加载失败，其他生成配置仍可编辑。').locator('..').getByRole('button').click();
  await expect(page.getByText('菜单目录加载失败，其他生成配置仍可编辑。')).toHaveCount(0);
  expect(state.unknown).toEqual([]);
});

test('client-web keeps devtools unselected', async ({ page }) => {
  await page.goto(`${clientUrl}/diagnostic?domain=devtools&key=tool%2Fgen%2Findex`);
  await expect(page.getByRole('heading', { name: '当前 App 未选择该能力' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('app=client-web domain=devtools key=tool/gen/index');
});
