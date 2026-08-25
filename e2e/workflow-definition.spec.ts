import { expect, test, type Page, type Route } from '@playwright/test';

type State = { requests: string[]; unknown: string[] };
const json = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });

const routes = [
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
      { path: 'spel', name: 'Spel', component: 'workflow/spel/index', meta: { title: '流程表达式' } }
    ]
  }
];

async function installApi(page: Page, state: State, permissions: string[]) {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    const key = request.method() + ' ' + path;
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
    if (path === '/system/menu/getRouters') return json(route, { code: 200, data: routes });
    if (path === '/workflow/category/list') {
      state.requests.push(key);
      return json(route, {
        code: 200,
        data: [{ categoryId: '1', parentId: 0, categoryName: '审批', orderNum: 1, createTime: '', children: [] }]
      });
    }
    if (path === '/workflow/category/categoryTree')
      return json(route, { code: 200, data: [{ id: '1', parentId: 0, label: '审批', weight: 1, children: [] }] });
    if (path === '/workflow/definition/list') {
      state.requests.push(key);
      return json(route, {
        code: 200,
        data: {
          rows: [{ id: 'd1', flowName: '请假审批', flowCode: 'leave', version: '1', isPublish: 0, activityStatus: 1 }],
          total: 1
        }
      });
    }
    if (path === '/workflow/spel/list') {
      state.requests.push(key);
      return json(route, {
        code: 200,
        data: {
          rows: [
            {
              id: 's1',
              componentName: 'owner',
              methodName: 'resolve',
              methodParams: '',
              viewSpel: '#owner',
              status: '0'
            }
          ],
          total: 1
        }
      });
    }
    if (
      (path === '/workflow/category' && request.method() === 'POST') ||
      (path === '/workflow/definition/publish/d1' && request.method() === 'PUT') ||
      (path === '/workflow/spel' && request.method() === 'POST')
    ) {
      state.requests.push(key);
      return json(route, { code: 200, data: null });
    }
    if (path === '/resource/message/box')
      return json(route, { code: 200, data: { systemList: [], noticeList: [], workflowList: [] } });
    if (path === '/resource/message') return route.fulfill({ contentType: 'text/event-stream', body: '' });
    state.unknown.push(key);
    return json(route, { code: 200, data: null });
  });
}

test('selected workflow manifest reaches terminal pages and preserves representative transports', async ({ page }) => {
  const state: State = { requests: [], unknown: [] };
  await installApi(page, state, ['*:*:*']);
  await page.goto('/login?redirect=%2Fworkflow%2Fcategory');
  await page.locator('.submit-button').click();
  await expect(page.getByRole('heading', { name: '流程分类' })).toBeVisible();
  await expect(page.getByText('审批', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '新增' }).click();
  await page.locator('.sidebar-container').getByText('流程定义', { exact: true }).click();
  await expect(page.getByText('请假审批', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '发布' }).click();
  await page.locator('.sidebar-container').getByText('流程表达式', { exact: true }).click();
  await expect(page.getByText('#owner', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '新增' }).click();
  await expect
    .poll(() => state.requests)
    .toEqual(
      expect.arrayContaining([
        'GET /workflow/category/list',
        'POST /workflow/category',
        'GET /workflow/definition/list',
        'PUT /workflow/definition/publish/d1',
        'GET /workflow/spel/list',
        'POST /workflow/spel'
      ])
    );
  expect(state.unknown).toEqual([]);
});

test('workflow permissions hide mutations without filtering the selected server menu', async ({ page }) => {
  const state: State = { requests: [], unknown: [] };
  await installApi(page, state, ['workflow:category:list']);
  await page.goto('/login?redirect=%2Fworkflow%2Fcategory');
  await page.locator('.submit-button').click();
  await expect(page.getByRole('heading', { name: '流程分类' })).toBeVisible();
  await expect(page.getByRole('button', { name: '新增' })).toHaveCount(0);
  expect(state.requests).toContain('GET /workflow/category/list');
  expect(state.unknown).toEqual([]);
});
