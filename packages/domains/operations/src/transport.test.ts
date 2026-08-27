import { describe, expect, it } from 'vitest';
import { projectOperationLogTransport, type OperationLogTransport } from './transport';

describe('operations OpenAPI transport boundary', () => {
  it('projects a transport record into the domain audit view', () => {
    const transport: OperationLogTransport = { operId: 4, title: 'Update', status: 0, costTime: 12 };
    expect(projectOperationLogTransport(transport)).toMatchObject({
      operId: 4,
      title: 'Update',
      status: 0,
      costTime: 12
    });
  });
});
