import type { HttpRequest } from '@namewta/platform-contracts';
import { describe, expect, it } from 'vitest';
import { createUserQueryPort } from './public';

describe('system public user seam', () => {
  it('exposes only the workflow selection fields and preserves query requests', async () => {
    const requests: HttpRequest[] = [];
    const users = [
      {
        userId: '7',
        userName: 'owner',
        nickName: '流程负责人',
        deptName: '研发部',
        status: '0',
        email: 'must-not-cross@example.test',
        phoneNumber: '13800000000',
        roles: [{ roleId: 'secret-role' }]
      }
    ];
    const port = createUserQueryPort({
      request: async request => {
        requests.push(request);
        return request.url.includes('optionselect')
          ? ({ code: 200, data: users } as never)
          : request.url.includes('deptTree')
            ? ({ code: 200, data: [{ id: '10', label: '研发部', children: [] }] } as never)
            : ({ code: 200, data: { rows: users, total: 1 } } as never);
      }
    });

    await expect(port.list({ pageNum: 1, pageSize: 10, userName: 'owner' })).resolves.toEqual({
      code: 200,
      data: {
        rows: [{ userId: '7', userName: 'owner', nickName: '流程负责人', deptName: '研发部', status: '0' }],
        total: 1
      }
    });
    await port.list({ pageNum: 1, pageSize: 10, userIds: ['8'] });
    const projectedOptions = await port.options(['7', 'a/b']);
    expect(projectedOptions).toEqual({
      code: 200,
      data: [{ userId: '7', userName: 'owner', nickName: '流程负责人', deptName: '研发部', status: '0' }]
    });
    await port.departmentTree();
    expect(requests).toEqual([
      { url: '/system/user/list', method: 'get', params: { pageNum: 1, pageSize: 10, userName: 'owner' } },
      { url: '/system/user/list', method: 'get', params: { pageNum: 1, pageSize: 10, userIds: ['8'] } },
      { url: '/system/user/optionselect?userIds=7,a%2Fb', method: 'get' },
      { url: '/system/user/deptTree', method: 'get' }
    ]);
    expect(JSON.stringify(projectedOptions)).not.toMatch(/must-not-cross|phoneNumber|roles|secret-role/);
  });

  it('propagates query failures without inventing empty success data', async () => {
    const failure = new Error('user query unavailable');
    const port = createUserQueryPort({ request: async () => Promise.reject(failure) });
    await expect(port.list({})).rejects.toBe(failure);
  });
});
