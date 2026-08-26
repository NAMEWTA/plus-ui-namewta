import { describe, expect, it } from 'vitest';
import { createCompletePayload, createTaskOperationPayload, enabledProcessButtons } from './index';

describe('workflow process action contracts', () => {
  it('enables only backend-supplied visible actions', () => {
    const enabled = enabledProcessButtons({
      buttonList: [
        { code: 'transfer', show: true },
        { code: 'termination', show: false }
      ]
    });
    expect([...enabled]).toEqual(['transfer']);
  });

  it('builds exact complete and operation payloads', () => {
    expect(
      createCompletePayload({
        taskId: 'task-1',
        message: ' 同意 ',
        messageType: ['1', '2'],
        variables: { days: 2 },
        assigneeMap: { approve: '7,8' },
        copyUsers: [{ userId: '9', nickName: '抄送人' }],
        fileId: 'file-1'
      })
    ).toEqual({
      taskId: 'task-1',
      message: '同意',
      messageType: ['1', '2'],
      variables: { days: 2 },
      assigneeMap: { approve: '7,8' },
      flowCopyList: [{ userId: '9', nickName: '抄送人' }],
      fileId: 'file-1'
    });
    expect(createTaskOperationPayload('task-1', [{ userId: '7', nickName: '用户' }], ' 转办 ', ['1'], false)).toEqual({
      taskId: 'task-1',
      userId: '7',
      message: '转办',
      messageType: ['1']
    });
  });
});
