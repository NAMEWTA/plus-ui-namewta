import { createWorkflowDefinitionService } from '@namewta/domain-workflow';
import request from '@/utils/request';

export const workflowService = createWorkflowDefinitionService({
  request: config => request(config) as never
});
