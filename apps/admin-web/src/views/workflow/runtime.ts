import { resolveAdminWebRegistration } from '@/router/adminManifestRegistry';

export async function loadWorkflowRuntimePage(componentKey: string) {
  const registration = resolveAdminWebRegistration(componentKey, 'workflow');
  if (!registration) throw new Error(`Workflow registration is unavailable: ${componentKey}`);
  return registration.load();
}
