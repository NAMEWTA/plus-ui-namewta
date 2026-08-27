import type { IdentityAccessService, IdentitySession } from '@namewta/domain-admin';

export interface IdentityAccessWebRuntime {
  onAuthenticated(session: IdentitySession): Promise<void> | void;
  service: IdentityAccessService;
}

export function requireIdentityAccessWebRuntime(
  runtime: IdentityAccessWebRuntime | undefined
): IdentityAccessWebRuntime {
  if (!runtime) throw new Error('IdentityAccessWebRuntime is required');
  return runtime;
}
