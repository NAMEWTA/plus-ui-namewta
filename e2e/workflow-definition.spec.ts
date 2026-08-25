import { expect, test, type Page, type Route } from '@playwright/test';

type State = {
  categories: Record<string, unknown>[];
  publishedDefinitions: Record<string, unknown>[];
  unpublishedDefinitions: Record<string, unknown>[];
  definitionRequests: string[];
  spels: Record<string, unknown>[];
  mutations: { method: string; path: string; body: unknown }[];
  unknown: string[];
};
const createState = (): State => ({
  categories: [{ categoryId: 'c1', parentId: 0, categoryName: '审批', orderNum: 1, createTime: '', children: [] }],
  publishedDefinitions: [
    { id: 'd0', flowName: '既有已发布流程', flowCode: 'published', version: '1', isPublish: 1, activityStatus: 1 }
  ],
  unpublishedDefinitions: [
    { id: 'd1', flowName: '请假审批', flowCode: 'leave', version: '1', isPublish: 0, activityStatus: 1 }
  ],
  definitionRequests: [],
  spels: [
    { id: 's1', componentName: 'owner', methodName: 'resolve', methodParams: '', viewSpel: '#owner', status: '0' }
  ],
  mutations: [],
  unknown: []
});
const json = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
const menus = [
  {
    path: '/workflow',
    name: 'Workflow',
    component: 'Layout',
    meta: { title: '工作流' },
    children: [
      { path: 'category', name: 'Category', component: 'workflow/category/index', meta: { title: '流程分类' } },
      {
        path: 'processDefinition',
        name: 'processDefinition',
        component: 'workflow/processDefinition/index',
        meta: { title: '流程定义' }
      },
      {
        path: 'design/index',
        name: 'WarmFlow',
        component: 'workflow/processDefinition/design',
        hidden: true,
        meta: { title: '流程设计' }
      },
      { path: 'spel', name: 'Spel', component: 'workflow/spel/index', meta: { title: '流程表达式' } }
    ]
  }
];

async function installApi(page: Page, state: State, permissions: string[]) {
  await page.route('**/prod-api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    const method = request.method();
    if (path.startsWith('/warm-flow-ui/')) return route.fulfill({ contentType: 'text/html', body: '<html></html>' });
    if (path === '/auth/client/context')
      return json(route, { code: 200, data: { clientEnabled: true, registerEnabled: true } });
    if (path === '/auth/code') return json(route, { code: 200, data: { captchaEnabled: false } });
    if (path === '/auth/login') return json(route, { code: 200, data: { access_token: 'workflow-token' } });
    if (path === '/system/user/getInfo')
      return json(route, {
        code: 200,
        data: {
          user: { userId: 1, userName: 'workflow-user', nickName: 'Workflow User', avatarUrl: '' },
          roles: ['operator'],
          permissions
        }
      });
    if (path === '/system/menu/getRouters') return json(route, { code: 200, data: menus });
    if (path === '/workflow/category/list') return json(route, { code: 200, data: state.categories });
    if (path === '/workflow/category/categoryTree')
      return json(route, {
        code: 200,
        data: state.categories.map(item => ({
          id: item.categoryId,
          parentId: item.parentId,
          label: item.categoryName,
          weight: item.orderNum,
          children: []
        }))
      });
    if (path === '/workflow/definition/list') {
      state.definitionRequests.push(method + ' ' + path);
      return json(route, {
        code: 200,
        data: { rows: state.publishedDefinitions, total: state.publishedDefinitions.length }
      });
    }
    if (path === '/workflow/definition/unPublishList') {
      state.definitionRequests.push(method + ' ' + path);
      return json(route, {
        code: 200,
        data: { rows: state.unpublishedDefinitions, total: state.unpublishedDefinitions.length }
      });
    }
    if (path === '/workflow/spel/list')
      return json(route, { code: 200, data: { rows: state.spels, total: state.spels.length } });
    if (path === '/workflow/category' && method === 'POST') {
      const body = request.postDataJSON();
      state.mutations.push({ method, path, body });
      state.categories.push({ ...body, categoryId: 'c2', createTime: '', children: [] });
      return json(route, { code: 200, data: null });
    }
    if (path === '/workflow/definition/publish/d1' && method === 'PUT') {
      state.mutations.push({ method, path, body: null });
      state.definitionRequests.push(method + ' ' + path);
      const published = state.unpublishedDefinitions.find(item => item.id === 'd1');
      state.unpublishedDefinitions = state.unpublishedDefinitions.filter(item => item.id !== 'd1');
      if (published) state.publishedDefinitions.push({ ...published, isPublish: 1 });
      return json(route, { code: 200, data: null });
    }
    if (path === '/workflow/spel' && method === 'POST') {
      const body = request.postDataJSON();
      state.mutations.push({ method, path, body });
      state.spels.push({ ...body, id: 's2' });
      return json(route, { code: 200, data: null });
    }
    if (path === '/resource/message/box')
      return json(route, { code: 200, data: { systemList: [], noticeList: [], workflowList: [] } });
    if (path === '/resource/message') return route.fulfill({ contentType: 'text/event-stream', body: '' });
    state.unknown.push(method + ' ' + path);
    return json(route, { code: 200, data: null });
  });
}

test('selected workflow manifest completes category, definition, designer and SpEL mutations', async ({ page }) => {
  const state = createState();
  await installApi(page, state, ['*:*:*']);
  await page.goto('/login?redirect=%2Fworkflow%2Fcategory');
  await page.locator('.submit-button').click();
  await expect(page.getByRole('heading', { name: '流程分类' })).toBeVisible();

  const categoryRow = page.getByRole('row').filter({ hasText: '审批' });
  await categoryRow.locator('button').nth(1).click();
  const categoryDialog = page.getByRole('dialog', { name: '添加流程分类' });
  await categoryDialog.getByPlaceholder('请输入分类名称').fill('财务审批');
  await categoryDialog.getByRole('button', { name: '确 定' }).click();
  await expect(page.getByText('财务审批', { exact: true })).toBeVisible();

  await page.locator('.sidebar-container').getByText('流程定义', { exact: true }).click();
  await expect(page.getByText('既有已发布流程', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: '未发布' }).click();
  await expect(page.getByText('请假审批', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '流程设计' }).click();
  await expect(page).toHaveURL(/\/workflow\/design\/index.*definitionId=d1.*disabled=false/);
  await expect(page.locator('iframe[title="流程设计"]')).toHaveAttribute('src', /id=d1&onlyDesignShow=false/);
  await page.evaluate(() => window.dispatchEvent(new MessageEvent('message', { data: { method: 'close' } })));
  await expect(page).toHaveURL(/\/workflow\/processDefinition(?:\?.*)?$/);
  await page.getByRole('button', { name: '发布流程' }).click();
  await page.getByRole('button', { name: '确定' }).click();
  await expect(
    page.getByRole('row').filter({ hasText: '请假审批' }).getByText('已发布', { exact: true })
  ).toBeVisible();

  await page.locator('.sidebar-container').getByText('流程表达式', { exact: true }).click();
  await page.getByRole('button', { name: '新增' }).first().click();
  const spelDialog = page.getByRole('dialog', { name: '添加流程spel表达式定义' });
  await spelDialog.getByPlaceholder('请输入组件名称').fill('spelRuleComponent');
  await spelDialog.getByPlaceholder('请输入方法名称').fill('resolveOwner');
  await spelDialog.getByPlaceholder('请输入方法参数').fill('deptId');
  await expect(spelDialog.getByText('#{@spelRuleComponent.resolveOwner(#deptId)}', { exact: true })).toBeVisible();
  await spelDialog.getByRole('button', { name: '确 定' }).click();
  await expect(page.getByText('#{@spelRuleComponent.resolveOwner(#deptId)}', { exact: true })).toBeVisible();

  expect(state.mutations).toEqual([
    { method: 'POST', path: '/workflow/category', body: { categoryName: '财务审批', parentId: 'c1', orderNum: 0 } },
    { method: 'PUT', path: '/workflow/definition/publish/d1', body: null },
    {
      method: 'POST',
      path: '/workflow/spel',
      body: {
        componentName: 'spelRuleComponent',
        methodName: 'resolveOwner',
        methodParams: 'deptId',
        viewSpel: '#{@spelRuleComponent.resolveOwner(#deptId)}',
        status: '0'
      }
    }
  ]);
  const unpublishedIndex = state.definitionRequests.indexOf('GET /workflow/definition/unPublishList');
  const publishIndex = state.definitionRequests.indexOf('PUT /workflow/definition/publish/d1');
  const refreshedPublishedIndex = state.definitionRequests.indexOf('GET /workflow/definition/list', publishIndex);
  expect(unpublishedIndex).toBeGreaterThan(-1);
  expect(publishIndex).toBeGreaterThan(unpublishedIndex);
  expect(refreshedPublishedIndex).toBeGreaterThan(publishIndex);
  expect(state.unknown).toEqual([]);
});

test('workflow permissions hide mutations without filtering selected server menus', async ({ page }) => {
  const state = createState();
  await installApi(page, state, ['workflow:category:list', 'workflow:category:query']);
  await page.goto('/login?redirect=%2Fworkflow%2Fcategory');
  await page.locator('.submit-button').click();
  await expect(page.getByRole('heading', { name: '流程分类' })).toBeVisible();
  await expect(page.getByRole('button', { name: '新增' })).toHaveCount(0);
  expect(state.mutations).toEqual([]);
  expect(state.unknown).toEqual([]);
});
