import type { WorkflowDefinitionService } from '@namewta/domain-workflow';

export interface WorkflowWebRuntime {
  confirm(message: string): Promise<void>;
  designUrl(definitionId: string): string;
  service: WorkflowDefinitionService;
  success(message: string): void;
}

export function requireWorkflowWebRuntime(runtime: WorkflowWebRuntime | undefined): WorkflowWebRuntime {
  if (!runtime) throw new Error('WorkflowWebRuntime is required');
  return runtime;
}
