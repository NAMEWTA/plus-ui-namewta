import { describe, expect, it } from 'vitest';
import { projectSystemUserTransport, type SystemUserTransport } from './transport';

describe('system OpenAPI transport boundary', () => {
  it('projects transport into the public user summary contract', () => {
    const transport: SystemUserTransport = { userId: 3, userName: 'demo', nickName: 'Demo' };
    expect(projectSystemUserTransport(transport)).toEqual({
      userId: 3,
      userName: 'demo',
      nickName: 'Demo',
      deptName: undefined,
      status: undefined
    });
  });
});
