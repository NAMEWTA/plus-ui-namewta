import { expect, test, type Page, type Route } from '@playwright/test';

type RuntimeState = {
  completeBodies: unknown[];
  failComplete: boolean;
  failUsers: boolean;
  invalidBodies: unknown[];
  network: string[];
  permissions: string[];
  unknown: string[];
  urgeBodies: unknown[];
};

const json = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });

const menus = [
  {
    path: '/workflow',
    name: 'Workflow',
    component: 'Layout',
    meta: { title: '工作流' },
    children: [
      {
        path: 'task/taskWaiting',
        name: 'taskWaiting',
        component: 'workflow/task/taskWaiting',
        meta: { title: '我的待办' }
      },
      {
        path: 'processInstance/index',
        name: 'processInstance',
        component: 'workflow/processInstance/index',
        meta: { title: '流程实例' }
      },
      {
        path: 'leave/index',
        name: 'leave',
        component: 'workflow/leave/index',
        meta: { title: '请假管理' }
      },
      {
        path: 'task/allTaskWaiting',
        name: 'allTaskWaiting',
        component: 'workflow/task/allTaskWaiting',
        meta: { title: '待办任务' }
      },
      {
        path: 'leaveEdit/index',
        name: 'leaveEdit',
        component: 'workflow/leave/leaveEdit',
        hidden: true,
        meta: { title: '请假申请' }
      }
    ]
  }
];

async function installRuntimeApi(page: Page, state: RuntimeState) {
  await page.route('**/prod-api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/prod-api', '');
    const method = request.method();
    state.network.push(`${method} ${path}`);
    if (path === '/auth/client/context')
      return json(route, { code: 200, data: { clientEnabled: true, registerEnabled: true } });
    if (path === '/auth/code') return json(route, { code: 200, data: { captchaEnabled: false } });
    if (path === '/auth/login') return json(route, { code: 200, data: { access_token: 'workflow-runtime-token' } });
    if (path === '/system/user/getInfo')
      return json(route, {
        code: 200,
        data: {
          user: { userId: '1', userName: 'operator', nickName: '流程操作员', avatarUrl: '' },
          roles: ['operator'],
          permissions: state.permissions
        }
      });
    if (path === '/system/menu/getRouters') return json(route, { code: 200, data: menus });
    if (path === '/workflow/task/pageByTaskWait')
      return json(route, {
        code: 200,
        data: {
          rows: [
            {
              id: 'task-1',
              instanceId: 'instance-1',
              businessId: 'leave-1',
              businessCode: 'LEAVE-1',
              businessTitle: '研发请假',
              flowCode: 'leave1',
              flowName: '请假审批',
              flowStatus: 'waiting',
              nodeCode: 'approve',
              nodeName: '部门审批',
              nodeType: 1,
              nodeRatio: 1,
              formCustom: 'N',
              formPath: '/workflow/leaveEdit/index'
            }
          ],
          total: 1
        }
      });
    if (path === '/workflow/task/pageByAllTaskWait')
      return json(route, {
        code: 200,
        data: {
          rows: [
            {
              id: 'task-2',
              instanceId: 'instance-2',
              businessId: 'leave-2',
              businessCode: 'LEAVE-2',
              businessTitle: '受限任务',
              flowCode: 'leave1',
              flowName: '请假审批',
              flowStatus: 'waiting',
              nodeCode: 'approve',
              nodeName: '部门审批',
              nodeType: 1,
              nodeRatio: 1,
              formCustom: 'N',
              formPath: '/workflow/leaveEdit/index'
            }
          ],
          total: 1
        }
      });
    if (path === '/workflow/task/pageByAllTaskFinish')
      return json(route, {
        code: 200,
        data: {
          rows: [
            {
              id: 'task-finished',
              instanceId: 'instance-finished',
              businessId: 'leave-finished',
              businessCode: 'LEAVE-FINISHED',
              businessTitle: '已完成任务',
              flowCode: 'leave1',
              flowName: '请假审批',
              flowStatus: 'finish',
              nodeCode: 'approve',
              nodeName: '部门审批',
              nodeType: 1,
              nodeRatio: 1,
              formCustom: 'N',
              formPath: '/workflow/leaveEdit/index'
            }
          ],
          total: 1
        }
      });
    if (path === '/workflow/category/categoryTree')
      return json(route, { code: 200, data: [{ id: '0', parentId: '0', label: '全部流程', weight: 0, children: [] }] });
    if (path === '/workflow/instance/pageByRunning')
      return json(route, {
        code: 200,
        data: {
          rows: [
            {
              id: 'instance-1',
              businessId: 'leave-1',
              businessCode: 'LEAVE-1',
              businessTitle: '待作废流程',
              definitionId: 'definition-1',
              flowCode: 'leave1',
              flowName: '请假审批',
              flowStatus: 'waiting',
              flowStatusName: '审批中',
              flowTaskList: [],
              activityStatus: 1,
              version: '1'
            }
          ],
          total: 1
        }
      });
    if (path === '/workflow/instance/invalid' && method === 'POST') {
      state.invalidBodies.push(request.postDataJSON());
      return json(route, { code: 200 });
    }
    if (path === '/workflow/task/urgeTask' && method === 'POST') {
      state.urgeBodies.push(request.postDataJSON());
      return json(route, { code: 200 });
    }
    if (path === '/workflow/leave/list')
      return json(route, {
        code: 200,
        data: {
          rows: [
            {
              id: 'draft-1',
              leaveType: '2',
              startDate: '2026-08-26',
              endDate: '2026-08-26',
              leaveDays: 1,
              remark: '草稿',
              status: 'draft'
            },
            {
              id: 'waiting-1',
              leaveType: '4',
              startDate: '2026-08-27',
              endDate: '2026-08-28',
              leaveDays: 2,
              remark: '审批中',
              status: 'waiting'
            }
          ],
          total: 2
        }
      });
    if (path === '/workflow/leave/leave-1')
      return json(route, {
        code: 200,
        data: {
          id: 'leave-1',
          applyCode: 'LEAVE-1',
          leaveType: '1',
          startDate: '2026-08-26',
          endDate: '2026-08-27',
          leaveDays: 2,
          remark: '原始请假原因',
          status: 'waiting'
        }
      });
    if (path === '/workflow/instance/flowHisTaskList/leave-1')
      return json(route, {
        code: 200,
        data: { instanceId: 'instance-1', list: [{ id: 'history-1', nodeName: '提交申请', createTime: '2026-08-26' }] }
      });
    if (path === '/system/user/list') {
      if (state.failUsers) return json(route, { code: 500, msg: '用户查询失败' });
      return json(route, {
        code: 200,
        data: {
          rows: [
            {
              userId: '7',
              userName: 'owner',
              nickName: '流程负责人',
              deptName: '研发部',
              status: '0',
              email: 'private@example.test',
              phoneNumber: '13800000000'
            }
          ],
          total: 1
        }
      });
    }
    if (path === '/system/user/deptTree')
      return json(route, { code: 200, data: [{ id: '10', label: '研发部', children: [] }] });
    if (path.startsWith('/system/user/optionselect'))
      return json(route, {
        code: 200,
        data: [
          {
            userId: '7',
            userName: 'owner',
            nickName: '流程负责人',
            deptName: '研发部',
            status: '0',
            email: 'private@example.test'
          }
        ]
      });
    if (path === '/workflow/task/completeTask' && method === 'POST') {
      if (state.failComplete) return json(route, { code: 500, msg: '任务办理失败' });
      state.completeBodies.push(request.postDataJSON());
      return json(route, { code: 200, data: null });
    }
    if (path === '/resource/message/box')
      return json(route, { code: 200, data: { systemList: [], noticeList: [], workflowList: [] } });
    if (path === '/resource/message') return route.fulfill({ contentType: 'text/event-stream', body: '' });
    state.unknown.push(`${method} ${path}`);
    return json(route, { code: 200, data: null });
  });
}

async function loginToTask(page: Page, state: RuntimeState) {
  await installRuntimeApi(page, state);
  await page.goto('/login?redirect=%2Fworkflow%2Ftask%2FtaskWaiting');
  await page.locator('.submit-button').click();
  await expect(page).toHaveURL(/\/workflow\/task\/taskWaiting$/);
  await expect(page.getByRole('cell', { name: '研发请假' })).toBeVisible();
  await page.getByRole('button', { name: '办理', exact: true }).click();
  await expect(page).toHaveURL(/\/workflow\/leaveEdit\/index\?.*taskId=task-1/);
  await expect(page).toHaveURL(/type=approval/);
  await expect(page.getByText('原始请假原因', { exact: true })).toBeVisible();
}

test('admin selected workflow completes a task through the public user seam', async ({ page }) => {
  const state: RuntimeState = {
    completeBodies: [],
    failComplete: false,
    failUsers: false,
    invalidBodies: [],
    network: [],
    permissions: ['workflow:task:list', 'workflow:leave:query', 'workflow:task:edit'],
    unknown: [],
    urgeBodies: []
  };
  await loginToTask(page, state);
  await page.getByLabel('审批意见').fill('同意办理');
  await page.getByRole('button', { name: '+', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '选择用户' });
  await expect(dialog.getByRole('cell', { name: '流程负责人' })).toBeVisible();
  await expect(dialog.getByText('private@example.test', { exact: true })).toHaveCount(0);
  await expect(dialog.getByText('13800000000', { exact: true })).toHaveCount(0);
  await dialog.locator('label.el-checkbox').first().click();
  await dialog.getByRole('button', { name: '确定', exact: true }).click();
  await page.getByRole('button', { name: '同意', exact: true }).click();
  await expect
    .poll(() => state.completeBodies)
    .toEqual([
      {
        taskId: 'task-1',
        message: '同意办理',
        flowCopyList: [{ userId: '7', nickName: '流程负责人' }]
      }
    ]);
  expect(state.network).toContain('GET /system/user/list');
  expect(state.unknown).toEqual([]);
});

test('user and task failures remain visible without clearing approval input', async ({ page }) => {
  const state: RuntimeState = {
    completeBodies: [],
    failComplete: true,
    failUsers: true,
    invalidBodies: [],
    network: [],
    permissions: ['workflow:task:list', 'workflow:leave:query', 'workflow:task:edit'],
    unknown: [],
    urgeBodies: []
  };
  await loginToTask(page, state);
  await page.getByLabel('审批意见').fill('保留这段审批意见');
  await page.getByRole('button', { name: '+', exact: true }).click();
  await expect(page.getByText('用户查询失败', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '同意', exact: true }).click();
  await expect(page.getByText('任务办理失败', { exact: true })).toBeVisible();
  await expect(page.getByLabel('审批意见')).toHaveValue('保留这段审批意见');
  expect(state.completeBodies).toEqual([]);
  expect(state.unknown).toEqual([]);
});

test('task edit controls fail closed when the permission contribution is absent', async ({ page }) => {
  const state: RuntimeState = {
    completeBodies: [],
    failComplete: false,
    failUsers: false,
    invalidBodies: [],
    network: [],
    permissions: ['workflow:task:list'],
    unknown: [],
    urgeBodies: []
  };
  await installRuntimeApi(page, state);
  await page.goto('/login?redirect=%2Fworkflow%2Ftask%2FallTaskWaiting');
  await page.locator('.submit-button').click();
  await expect(page).toHaveURL(/\/workflow\/task\/allTaskWaiting$/);
  await expect(page.getByRole('cell', { name: '受限任务' })).toBeVisible();
  await expect(page.getByRole('button', { name: '催办', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '修改办理人', exact: true })).toHaveCount(0);
  expect(state.unknown).toEqual([]);
});

test('all-task runtime separates finished work and sends exact urge payload', async ({ page }) => {
  const state: RuntimeState = {
    completeBodies: [],
    failComplete: false,
    failUsers: false,
    invalidBodies: [],
    network: [],
    permissions: ['workflow:task:list', 'workflow:task:edit'],
    unknown: [],
    urgeBodies: []
  };
  await installRuntimeApi(page, state);
  await page.goto('/login?redirect=%2Fworkflow%2Ftask%2FallTaskWaiting');
  await page.locator('.submit-button').click();
  await expect(page.getByRole('cell', { name: '受限任务' })).toBeVisible();
  await page.getByRole('button', { name: '催办', exact: true }).click();
  await page.getByPlaceholder('请输入催办消息').fill('请在今天完成');
  await page.getByRole('dialog', { name: '任务催办' }).getByRole('button', { name: '确定', exact: true }).click();
  await expect.poll(() => state.urgeBodies).toEqual([{ taskIdList: ['task-2'], message: '请在今天完成' }]);
  await page.getByRole('tab', { name: '已办任务' }).click();
  await expect(page.getByRole('cell', { name: '已完成任务' })).toBeVisible();
  await expect(page.getByRole('button', { name: '催办', exact: true })).toHaveCount(0);
  expect(state.network).toContain('GET /workflow/task/pageByAllTaskFinish');
  expect(state.unknown).toEqual([]);
});

test('instance invalidation requires a reason and posts exact FlowInvalidBo', async ({ page }) => {
  const state: RuntimeState = {
    completeBodies: [],
    failComplete: false,
    failUsers: false,
    invalidBodies: [],
    network: [],
    permissions: ['workflow:instance:list', 'workflow:instance:invalid'],
    unknown: [],
    urgeBodies: []
  };
  await installRuntimeApi(page, state);
  await page.goto('/login?redirect=%2Fworkflow%2FprocessInstance%2Findex');
  await page.locator('.submit-button').click();
  await expect(page.getByRole('cell', { name: '待作废流程' })).toBeVisible();
  await page.getByRole('button', { name: '作废', exact: true }).click();
  await page.getByPlaceholder('请输入作废原因').fill('申请内容失效');
  await page.getByRole('dialog', { name: '作废流程' }).getByRole('button', { name: '确认作废' }).click();
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await expect.poll(() => state.invalidBodies).toEqual([{ id: 'instance-1', comment: '申请内容失效' }]);
  expect(state.unknown).toEqual([]);
});

test('leave controls follow exact state and permission gates', async ({ page }) => {
  const state: RuntimeState = {
    completeBodies: [],
    failComplete: false,
    failUsers: false,
    invalidBodies: [],
    network: [],
    permissions: ['workflow:leave:list'],
    unknown: [],
    urgeBodies: []
  };
  await installRuntimeApi(page, state);
  await page.goto('/login?redirect=%2Fworkflow%2Fleave%2Findex');
  await page.locator('.submit-button').click();
  const draft = page.getByRole('row').filter({ hasText: '草稿' });
  const waiting = page.getByRole('row').filter({ hasText: '审批中' });
  await expect(draft.getByRole('button', { name: '修改', exact: true })).toHaveCount(0);
  await expect(draft.getByRole('button', { name: '删除', exact: true })).toHaveCount(0);
  await expect(waiting.getByRole('button', { name: '撤销', exact: true })).toBeVisible();
  await expect(waiting.getByRole('button', { name: '修改', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '导出', exact: true })).toHaveCount(0);
  expect(state.unknown).toEqual([]);
});
