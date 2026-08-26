import { describe, expect, it } from 'vitest';
import { createFlowInvalidPayload, createUrgePayload, isCancellableLeaveStatus, isEditableLeaveStatus } from './index';

describe('workflow runtime action contracts', () => {
  it('builds the exact FlowInvalidBo and urge payloads', () => {
    expect(createFlowInvalidPayload('instance/1', '  reason  ')).toEqual({ id: 'instance/1', comment: 'reason' });
    expect(createUrgePayload(['task/1', 'task,2'], '  please act  ')).toEqual({
      taskIdList: ['task/1', 'task,2'],
      message: 'please act',
      messageType: ['1']
    });
  });

  it('keeps leave mutations fail-closed by workflow state', () => {
    expect(['draft', 'cancel', 'back'].every(isEditableLeaveStatus)).toBe(true);
    expect(['waiting', 'finish', undefined].some(isEditableLeaveStatus)).toBe(false);
    expect(isCancellableLeaveStatus('waiting')).toBe(true);
    expect(isCancellableLeaveStatus('draft')).toBe(false);
  });
});
