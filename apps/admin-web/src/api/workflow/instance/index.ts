import type { FlowInvalidPayload } from '@namewta/domain-workflow';
import type { FlowInstanceQuery } from './types';
import { workflowService } from '../runtime';

export const pageByRunning = (query: FlowInstanceQuery) => workflowService.pageRunningInstances(query);
export const pageByFinish = (query: FlowInstanceQuery) => workflowService.pageFinishedInstances(query);
export const pageByCurrent = (query: FlowInstanceQuery) => workflowService.pageCurrentInstances(query);
export const flowHisTaskList = (businessId: string | number) => workflowService.flowHistory(businessId);
export const cancelProcessApply = (data: Record<string, unknown>) => workflowService.cancelProcess(data);
export const instanceVariable = (instanceId: string | number) => workflowService.instanceVariables(instanceId);
export const deleteByInstanceIds = (ids: string | number | readonly (string | number)[]) =>
  workflowService.deleteInstances(ids);
export const deleteHisByInstanceIds = (ids: string | number | readonly (string | number)[]) =>
  workflowService.deleteHistoricInstances(ids);
export const invalid = (data: FlowInvalidPayload) => workflowService.invalidateInstance(data);
export const updateVariable = (data: Record<string, unknown>) => workflowService.updateInstanceVariables(data);
