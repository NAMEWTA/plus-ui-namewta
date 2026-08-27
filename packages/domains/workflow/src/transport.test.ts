import { describe, expect, it } from 'vitest';
import { projectWorkflowTaskTransport, type WorkflowTaskTransport } from './transport';

describe('workflow OpenAPI transport boundary', () => {
  it('normalizes backend numeric identifiers for the domain view', () => {
    const transport: WorkflowTaskTransport = { id: 1, instanceId: 2, flowCode: 'leave', nodeCode: 'approve' };
    expect(projectWorkflowTaskTransport(transport)).toMatchObject({ id: 1, instanceId: '2', flowCode: 'leave' });
  });
});
