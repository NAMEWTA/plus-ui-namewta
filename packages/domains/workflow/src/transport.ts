import type { OpenApiSchema } from '@namewta/api-contracts';
import type { WorkflowTask } from './index';

export type WorkflowTaskTransport = OpenApiSchema<'FlowTaskVo'>;

export function projectWorkflowTaskTransport(value: WorkflowTaskTransport): WorkflowTask {
  return {
    ...(value as unknown as WorkflowTask),
    id: value.id ?? '',
    instanceId: value.instanceId === undefined ? '' : String(value.instanceId),
    flowCode: value.flowCode ?? '',
    flowName: value.flowName ?? '',
    flowStatus: value.flowStatus ?? '',
    nodeCode: value.nodeCode ?? '',
    nodeName: value.nodeName ?? '',
    businessId: value.businessId ?? '',
    businessCode: value.businessCode ?? '',
    businessTitle: value.businessTitle ?? '',
    formCustom: value.formCustom ?? '',
    formPath: value.formPath ?? '',
    nodeRatio: value.nodeRatio ?? '',
    nodeType: value.nodeType ?? 0
  };
}
