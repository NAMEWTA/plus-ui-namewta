import { workflowDomainModule } from '@namewta/domain-workflow';
import { AppRuntimeError, composeAppRuntime } from '@namewta/platform-app-runtime';
import { describe, expect, it, vi } from 'vitest';
import { createWorkflowWebDomain } from './index';

const runtime = {
  service: {},
  confirm: vi.fn(),
  success: vi.fn(),
  designUrl: vi.fn(id => '/workflow/design/' + id)
} as never;

describe('workflow web-domain manifest', () => {
  it('publishes exact server keys, component names and permission contributions', () => {
    const manifest = createWorkflowWebDomain(runtime);
    expect(manifest.registrations.map(({ componentKey, componentName }) => ({ componentKey, componentName }))).toEqual([
      { componentKey: 'workflow/category/index', componentName: 'Category' },
      { componentKey: 'workflow/processDefinition/index', componentName: 'processDefinition' },
      { componentKey: 'workflow/processDefinition/design', componentName: 'WarmFlow' },
      { componentKey: 'workflow/spel/index', componentName: 'Spel' }
    ]);
    expect(manifest.permissions.map(item => item.id)).toEqual([
      'workflow-category',
      'workflow-definition',
      'workflow-spel'
    ]);
    expect(manifest.permissions.flatMap(item => item.permissions)).toContain('workflow:definition:publish');
  });

  it('registers workflow only when selected and rejects duplicate component keys', () => {
    const manifest = createWorkflowWebDomain(runtime);
    const selected = composeAppRuntime({
      appId: 'admin-web',
      domainModules: [workflowDomainModule],
      manifests: [manifest],
      selectedDomainIds: ['workflow'],
      selectedManifestIds: ['web-domain-workflow']
    });
    expect(selected.componentKeys()).toEqual([
      'workflow/category/index',
      'workflow/processDefinition/design',
      'workflow/processDefinition/index',
      'workflow/spel/index'
    ]);
    const unselected = composeAppRuntime({
      appId: 'client-web',
      domainModules: [],
      manifests: [manifest],
      selectedDomainIds: [],
      selectedManifestIds: []
    });
    expect(unselected.componentKeys()).toEqual([]);
    const duplicate = {
      ...manifest,
      id: 'workflow-duplicate',
      registrations: [{ ...manifest.registrations[0], id: 'duplicate' }]
    };
    expect(() =>
      composeAppRuntime({
        appId: 'admin-web',
        domainModules: [workflowDomainModule],
        manifests: [manifest, duplicate],
        selectedDomainIds: ['workflow'],
        selectedManifestIds: ['web-domain-workflow', 'workflow-duplicate']
      })
    ).toThrowError(AppRuntimeError);
  });
});
