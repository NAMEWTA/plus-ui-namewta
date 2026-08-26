import type { HttpRequest } from '@namewta/platform-contracts';
import { describe, expect, it } from 'vitest';
import { createUserQueryPort } from './index';

describe('system-admin public user seam', () => {
  it('exposes only the workflow selection fields and preserves query requests', async () => {
    const requests: HttpRequest[] = [];
    const users = [{ userId: '7', userName: 'owner', nickName: '流程负责人', deptName: '研发部', status: '0' }];
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

    await expect(port.list({ pageNum: 1, pageSize: 10, userName: 'owner' })).resolves.toMatchObject({
      data: { rows: users, total: 1 }
    });
    await port.options(['7', 'a/b']);
    await port.departmentTree();
    expect(requests).toEqual([
      { url: '/system/user/list', method: 'get', params: { pageNum: 1, pageSize: 10, userName: 'owner' } },
      { url: '/system/user/optionselect?userIds=7,a%2Fb', method: 'get' },
      { url: '/system/user/deptTree', method: 'get' }
    ]);
    expect(Object.keys(users[0])).toEqual(['userId', 'userName', 'nickName', 'deptName', 'status']);
  });

  it('propagates query failures without inventing empty success data', async () => {
    const failure = new Error('user query unavailable');
    const port = createUserQueryPort({ request: async () => Promise.reject(failure) });
    await expect(port.list({})).rejects.toBe(failure);
  });
});
