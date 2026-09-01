import type { Identifier, OssAccessUrl, ProfileService, ProfileType } from '@namewta/domain-profile';
import type { Component } from 'vue';

export interface ProfileUserOption {
  label: string;
  userId: Identifier;
}

export interface ProfileWorkflowCommand {
  comment: string;
  taskId: Identifier;
  variables?: Record<string, unknown>;
}

export interface ProfileWebRuntime {
  closeCurrentPage(): Promise<void> | void;
  completeWorkflowTask(command: ProfileWorkflowCommand): Promise<void>;
  confirm(message: string): Promise<void>;
  downloadMaterial(access: OssAccessUrl): Promise<void> | void;
  error(message: string): void;
  fileUpload: Component;
  findUsers(profileType: ProfileType, keyword: string): Promise<readonly ProfileUserOption[]>;
  hasPermission(permission: string): boolean;
  service: ProfileService;
  success(message: string): void;
  warning(message: string): void;
}

export function requireProfileWebRuntime(runtime: ProfileWebRuntime | undefined): ProfileWebRuntime {
  if (!runtime) throw new Error('ProfileWebRuntime is required');
  return runtime;
}
