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
  importDataNames: string[];
  importResponseOrder: string[];
  metadataClientIds: string[];
  reverseImportResponses: boolean;
  unknown: string[];
  updates: Array<Record<string, unknown>>;
};
const createState = (): ApiState => ({
  auxiliaryMode: 'success',
  downloadMode: 'valid',
  downloadRequests: 0,
  importDataNames: [],
  importResponseOrder: [],
  metadataClientIds: [],
  reverseImportResponses: false,
  unknown: [],
  updates: []
});
const missingDataDescriptorZip = () => {
  const bytes = Buffer.alloc(98);
  bytes.writeUInt32LE(0x04034b50, 0);
  bytes.writeUInt16LE(0x0008, 6);
  bytes.writeUInt32LE(0x02014b50, 30);
  bytes.writeUInt16LE(0x0008, 38);
  bytes.writeUInt32LE(0, 72);
  bytes.writeUInt32LE(0x06054b50, 76);
  bytes.writeUInt16LE(1, 84);
  bytes.writeUInt16LE(1, 86);
  bytes.writeUInt32LE(46, 88);
  bytes.writeUInt32LE(30, 92);
  return bytes;
};

async function installApi(page: Page, state: ApiState) {
  await page.route('**/prod-api/**', async route => {
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
    if (path === '/tool/gen/db/list') {
      const dataName = url.searchParams.get('dataName') ?? '';
      state.importDataNames.push(dataName);
      if (state.reverseImportResponses && !dataName) await new Promise(resolve => setTimeout(resolve, 200));
      await json(route, {
        code: 200,
        data: {
          rows: [
            {
              tableName: state.reverseImportResponses && !dataName ? 'stale_table' : 'candidate_table',
              tableComment: dataName ? '默认数据源候选表' : '可导入候选表',
              createTime: '2026-08-26 22:00:00',
              updateTime: '2026-08-26 23:00:00'
            }
          ],
          total: 1
        }
      });
      state.importResponseOrder.push(dataName);
      return;
    }
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
        return route.fulfill({ contentType: 'application/zip', body: missingDataDescriptorZip() });
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
  const previewDialog = page.getByRole('dialog', { name: '代码预览' });
  await expect(previewDialog).toBeVisible();
  await expect(page.getByTestId('generator-preview-source')).toContainText('public class ProofTable {}');
  await page.keyboard.press('Escape');
  await expect(previewDialog).toBeHidden();

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
  await expect(page.getByRole('tabpanel', { name: '生成信息' }).getByText('系统工具', { exact: true })).toBeVisible();
  const chooseOption = async (testId: string, optionName: RegExp) => {
    const combobox = page.getByTestId(testId).getByRole('combobox');
    await combobox.click();
    const listboxId = await combobox.getAttribute('aria-controls');
    expect(listboxId).toBeTruthy();
    const listbox = page.locator(`[id="${listboxId}"]`);
    await expect(listbox).toBeVisible();
    await listbox.getByRole('option', { name: optionName }).click();
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
  };
  await page.getByTestId('enable-unique').click();
  await chooseOption('unique-fields', /name：名称/);
  await page.getByTestId('enable-sort').click();
  await chooseOption('sort-field', /sort_num：排序/);
  await page.getByRole('radio', { name: '树表' }).click();
  await page.getByTestId('tree-root-value').locator('input').fill('ROOT');
  await chooseOption('tree-name', /name：名称/);
  await chooseOption('tree-order', /sort_num：排序/);
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
  await page.getByRole('button', { name: '导入' }).click();
  const importDialog = page.getByRole('dialog', { name: '导入表' });
  await expect(importDialog).toBeVisible();
  await expect(importDialog.getByText('candidate_table', { exact: true })).toBeVisible();
  await expect(importDialog.getByText('导入数据源加载失败，仍可查询默认数据源。')).toBeVisible();
  state.auxiliaryMode = 'success';
  await importDialog.getByRole('button', { name: '重新加载' }).click();
  await expect(importDialog.getByText('导入数据源加载失败，仍可查询默认数据源。')).toHaveCount(0);
  await importDialog.getByRole('button', { name: '取消' }).click();
  await page.getByText('数据源列表加载失败，表格仍可使用。').locator('..').getByRole('button').click();
  await expect(page.getByText('数据源列表加载失败，表格仍可使用。')).toHaveCount(0);

  state.auxiliaryMode = 'failure';
  await row.locator('button').nth(1).click();
  await expect(page.getByText('proof_id', { exact: true })).toBeVisible();
  await expect(page.getByText('字典类型加载失败，其他字段仍可编辑。')).toBeVisible();
  await page.getByRole('tab', { name: '生成信息' }).click();
  await expect(page.getByRole('textbox', { name: '生成包路径' })).toHaveValue('org.proof');
  await expect(page.getByText('菜单目录加载失败，其他生成配置仍可编辑。')).toBeVisible();
  state.auxiliaryMode = 'success';
  await page.getByText('菜单目录加载失败，其他生成配置仍可编辑。').locator('..').getByRole('button').click();
  await expect(page.getByText('菜单目录加载失败，其他生成配置仍可编辑。')).toHaveCount(0);
  expect(state.unknown).toEqual([]);
});

test('import table ignores a stale empty-source response after resolving the default source', async ({ page }) => {
  const state = createState();
  state.reverseImportResponses = true;
  await installApi(page, state);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'devtools-import-race-proof'));
  await page.goto(`${adminUrl}/tool-gen`);
  await expect(
    page.locator('.devtools-generator-page .el-table__body tr').filter({ hasText: 'proof_table' })
  ).toBeVisible();
  await page.getByRole('button', { name: '导入' }).click();

  const importDialog = page.getByRole('dialog', { name: '导入表' });
  await expect(importDialog.getByText('candidate_table', { exact: true })).toBeVisible();
  await expect.poll(() => state.importDataNames).toEqual(['', 'master']);
  await expect.poll(() => state.importResponseOrder).toEqual(['master', '']);
  await expect(importDialog.getByText('candidate_table', { exact: true })).toBeVisible();
  await expect(importDialog.getByText('stale_table', { exact: true })).toHaveCount(0);
  expect(state.unknown).toEqual([]);
});

test('client-web keeps devtools unselected', async ({ page }) => {
  await page.goto(`${clientUrl}/diagnostic?domain=devtools&key=tool%2Fgen%2Findex`);
  await expect(page.getByRole('heading', { name: '当前 App 未选择该能力' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('app=client-web domain=devtools key=tool/gen/index');
});
