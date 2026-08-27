import type { OpenApiSchema } from '@namewta/api-contracts';
import type { WorkflowTask } from './index';

export type WorkflowTaskTransport = OpenApiSchema<'FlowTaskVo'>;
export type WorkflowTaskContractView = Pick<
  WorkflowTask,
  | 'businessCode'
  | 'businessId'
  | 'businessTitle'
  | 'flowCode'
  | 'flowName'
  | 'flowStatus'
  | 'id'
  | 'instanceId'
  | 'nodeCode'
  | 'nodeName'
>;

export function projectWorkflowTaskTransport(value: WorkflowTaskTransport): WorkflowTaskContractView {
  return {
    id: value.id ?? '',
    instanceId: value.instanceId === undefined ? '' : String(value.instanceId),
    flowCode: value.flowCode ?? '',
    flowName: value.flowName ?? '',
    flowStatus: value.flowStatus ?? '',
    nodeCode: value.nodeCode ?? '',
    nodeName: value.nodeName ?? '',
    businessId: value.businessId ?? '',
    businessCode: value.businessCode ?? '',
    businessTitle: value.businessTitle ?? ''
  };
}
