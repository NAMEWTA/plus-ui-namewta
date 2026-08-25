import type { WorkflowDefinitionService } from '@namewta/domain-workflow';
import type { Ref } from 'vue';

export interface WorkflowDictOption {
  label: string;
  value: string;
}

export interface WorkflowWebRuntime {
  confirm(message: string): Promise<void>;
  closeDesigner(activeName: string | undefined): Promise<void> | void;
  designUrl(definitionId: string, disabled: boolean): string;
  dicts(...types: string[]): Record<string, Ref<WorkflowDictOption[]>>;
  download(url: string, params: unknown, fileName: string): Promise<void> | void;
  error(message: string): void;
  service: WorkflowDefinitionService;
  success(message: string): void;
}

export function requireWorkflowWebRuntime(runtime: WorkflowWebRuntime | undefined): WorkflowWebRuntime {
  if (!runtime) throw new Error('WorkflowWebRuntime is required');
  return runtime;
}
