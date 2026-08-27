import type { TaskOperationPayload, TerminateTaskPayload, UrgeTaskPayload } from '@namewta/domain-workflow';
import type { TaskOperationBo, TaskQuery } from './types';
import { workflowService } from '../runtime';

export const pageByTaskWait = (query: TaskQuery) => workflowService.pageTaskWaiting(query);
export const pageByTaskFinish = (query: TaskQuery) => workflowService.pageTaskFinished(query);
export const pageByTaskCopy = (query: TaskQuery) => workflowService.pageTaskCopies(query);
export const pageByAllTaskWait = (query: TaskQuery) => workflowService.pageAllTaskWaiting(query);
export const pageByAllTaskFinish = (query: TaskQuery) => workflowService.pageAllTaskFinished(query);
export const startWorkFlow = (data: Record<string, unknown>) => workflowService.startWorkflow(data);
export const completeTask = (data: Record<string, unknown>) => workflowService.completeTask(data);
export const backProcess = (data: Record<string, unknown>) => workflowService.backProcess(data);
export const getTask = (taskId: string | number) => workflowService.getTask(taskId);
export const updateAssignee = (taskIdList: string[], userId: string | number) =>
  workflowService.updateAssignee(taskIdList, userId);
export const terminationTask = (data: TerminateTaskPayload) => workflowService.terminateTask(data);
export const getBackTaskNode = (taskId: string | number, nodeCode: string) =>
  workflowService.getBackTaskNodes(taskId, nodeCode);
export const taskOperation = (data: TaskOperationBo, operation: string) =>
  workflowService.operateTask(data as TaskOperationPayload, operation);
export const currentTaskAllUser = (taskId: string | number) => workflowService.currentTaskUsers(taskId);
export const getNextNodeList = (data: Record<string, unknown>) => workflowService.getNextNodes(data);
export const urgeTask = (data: UrgeTaskPayload) => workflowService.urgeTask(data);
