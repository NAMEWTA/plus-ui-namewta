import { workflowDomainModule } from '@namewta/domain-workflow';
import { AppRuntimeError, composeAppRuntime } from '@namewta/platform-app-runtime';
import { describe, expect, it, vi } from 'vitest';
import { reactive } from 'vue';
import { createDesignerController } from './designer';
import { createLiveWorkflowDictRefs, createWorkflowWebDomain } from './index';

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
    expect(manifest.permissions.flatMap(item => item.permissions)).toContain('workflow:category:query');
    expect(manifest.permissions.flatMap(item => item.permissions)).toContain('workflow:spel:query');
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

describe('workflow designer controller', () => {
  it('preserves definitionId, disabled and close-return semantics', async () => {
    const designUrl = vi.fn(async () => '/designer');
    const closeDesigner = vi.fn();
    const controller = createDesignerController(
      {
        service: {},
        confirm: vi.fn(),
        success: vi.fn(),
        error: vi.fn(),
        dicts: vi.fn(),
        download: vi.fn(),
        designUrl,
        closeDesigner
      } as never,
      { definitionId: 'definition/a', disabled: 'true', activeName: '1' }
    );
    await expect(controller.url()).resolves.toBe('/designer');
    expect(designUrl).toHaveBeenCalledWith('definition/a', true);
    await controller.onMessage({ method: 'close' });
    expect(closeDesigner).toHaveBeenCalledWith('1');
  });
});

describe('workflow host adapters', () => {
  it('keeps asynchronously loaded dictionary properties live after reassignment', async () => {
    const source = reactive({ status: [{ label: '初始', value: '0' }] });
    let load!: (value: typeof source) => void;
    const dicts = createLiveWorkflowDictRefs(['status'], () => new Promise(resolve => (load = resolve)));

    expect(dicts.status.value).toEqual([]);
    load(source);
    await vi.waitFor(() => expect(dicts.status.value).toEqual([{ label: '初始', value: '0' }]));
    source.status = [{ label: '已加载', value: '1' }];
    await vi.waitFor(() => expect(dicts.status.value).toEqual([{ label: '已加载', value: '1' }]));
  });
});
