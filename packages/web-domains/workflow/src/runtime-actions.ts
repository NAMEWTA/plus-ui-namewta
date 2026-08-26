import type { FlowInvalidPayload, UrgeTaskPayload } from '@namewta/domain-workflow';

export const createFlowInvalidPayload = (id: string | number, comment: string): FlowInvalidPayload => ({
  id,
  comment: comment.trim()
});

export const createUrgePayload = (taskIds: readonly (string | number)[], message: string): UrgeTaskPayload => ({
  taskIdList: [...taskIds],
  message: message.trim()
});

export const isEditableLeaveStatus = (status: string | undefined) =>
  status === 'draft' || status === 'cancel' || status === 'back';

export const isCancellableLeaveStatus = (status: string | undefined) => status === 'waiting';
