import type { FlowCopy, TaskOperationPayload, UserSummary, WorkflowTask } from '@namewta/domain-workflow';

export type ProcessButtonCode =
  | 'addSign'
  | 'back'
  | 'copy'
  | 'file'
  | 'pop'
  | 'subSign'
  | 'termination'
  | 'transfer'
  | 'trust';

export const enabledProcessButtons = (task: Pick<WorkflowTask, 'buttonList'>): ReadonlySet<string> =>
  new Set(task.buttonList?.filter(button => button.show).map(button => button.code));

export const createTaskOperationPayload = (
  taskId: string | number,
  users: readonly UserSummary[],
  message: string,
  messageType: readonly string[],
  multiple: boolean
): TaskOperationPayload => ({
  taskId,
  ...(multiple ? { userIds: users.map(user => user.userId) } : { userId: users[0]?.userId }),
  message: message.trim(),
  messageType: [...messageType]
});

export const createCompletePayload = (input: {
  assigneeMap: Readonly<Record<string, string>>;
  copyUsers: readonly FlowCopy[];
  fileId?: string;
  message: string;
  messageType: readonly string[];
  taskId: string | number;
  variables: Readonly<Record<string, unknown>>;
}) => ({
  taskId: input.taskId,
  message: input.message.trim(),
  messageType: [...input.messageType],
  variables: { ...input.variables },
  assigneeMap: { ...input.assigneeMap },
  flowCopyList: input.copyUsers.map(({ userId, nickName }) => ({ userId, nickName })),
  ...(input.fileId ? { fileId: input.fileId } : {})
});
