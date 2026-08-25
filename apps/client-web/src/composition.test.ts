import type { DemoWebRuntime } from '@namewta/web-domain-demo';
import type { IdentityAccessWebRuntime } from '@namewta/web-domain-identity-access';
import { describe, expect, it, vi } from 'vitest';
import { clientCompositionManifest, composeClientRuntime } from './composition';
import { createT06PermissionDirective } from './permissionProof';
import { resolveClientManifestDiagnostic } from './router';

const identityRuntime = (): IdentityAccessWebRuntime => ({
  service: {
    client: { clientId: 'client-proof' },
    login: vi.fn(),
    prepareLogin: vi.fn()
  },
  onAuthenticated: vi.fn()
});

const demoRuntime = (): DemoWebRuntime => ({
  confirm: vi.fn(),
  download: vi.fn(),
  service: {
    addDemo: vi.fn(),
    addTree: vi.fn(),
    deleteDemo: vi.fn(),
    deleteTree: vi.fn(),
    getDemo: vi.fn(),
    getTree: vi.fn(),
    listDemo: vi.fn(),
    listTree: vi.fn(),
    updateDemo: vi.fn(),
    updateTree: vi.fn()
  },
  success: vi.fn()
});

describe('client web composition', () => {
  it('selects only identity-access and demo through public manifests', () => {
    const runtime = composeClientRuntime({ demo: demoRuntime(), identity: identityRuntime() });

    expect(clientCompositionManifest).toEqual({
      appId: 'client-web',
      selectedDomainIds: ['identity-access', 'demo'],
      selectedManifestIds: ['web-domain-identity-access', 'web-domain-demo']
    });
    expect(runtime.componentKeys()).toEqual(['demo/demo/index', 'demo/tree/index', 'identity-access/login/index']);
    expect(runtime.messages().map(item => item.namespace)).toEqual(['identity-access', 'demo']);
    expect(runtime.componentKeys()).not.toContain('workflow/task/index');
    expect(Object.isFrozen(clientCompositionManifest)).toBe(true);
    expect(Object.isFrozen(clientCompositionManifest.selectedDomainIds)).toBe(true);
  });

  it('returns a stable app/domain/key diagnostic for an unselected registration', () => {
    const runtime = composeClientRuntime({ demo: demoRuntime(), identity: identityRuntime() });

    expect(() => runtime.resolve({ domainId: 'workflow', componentKey: 'workflow/task/index' })).toThrowError(
      expect.objectContaining({
        code: 'missing-component-key',
        appId: 'client-web',
        domainId: 'workflow',
        componentKey: 'workflow/task/index'
      })
    );
  });

  it('builds the visible diagnostic by executing the runtime resolver', () => {
    const runtime = composeClientRuntime({ demo: demoRuntime(), identity: identityRuntime() });
    const resolve = vi.fn(runtime.resolve);

    expect(
      resolveClientManifestDiagnostic({ resolve }, { domainId: 'workflow', componentKey: 'workflow/task/index' })
    ).toEqual({
      appId: 'client-web',
      code: 'missing-component-key',
      componentKey: 'workflow/task/index',
      domainId: 'workflow',
      message: '[missing-component-key] app=client-web domain=workflow key=workflow/task/index'
    });
    expect(resolve).toHaveBeenCalledWith({ domainId: 'workflow', componentKey: 'workflow/task/index' });
  });

  it('fails closed for demo permission controls until T-07 installs access evaluation', () => {
    const remove = vi.fn();

    createT06PermissionDirective().mounted({ remove });

    expect(remove).toHaveBeenCalledOnce();
  });
});
