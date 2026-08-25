import { describe, expect, it, vi } from 'vitest';
import {
  AppRuntimeError,
  composeAppRuntime,
  type DomainModule,
  type WebComponentRegistration,
  type WebDomainManifest
} from './index';

const domain = (id: string): DomainModule => ({
  id,
  backendModules: [`ruoyi-${id}`],
  capabilities: [`${id}:read`]
});

const manifest = (
  id: string,
  domainId: string,
  components: Record<string, WebComponentRegistration<string>>
): WebDomainManifest<string> => ({ id, domainId, components });

describe('app runtime manifest registry', () => {
  it('registers only selected manifests and resolves their public component registrations', () => {
    const demoLoader = vi.fn(async () => 'demo-view');
    const hiddenLoader = vi.fn(async () => 'hidden-view');
    const runtime = composeAppRuntime({
      appId: 'admin-web',
      domainModules: [domain('demo'), domain('hidden')],
      manifests: [
        manifest('web-domain-demo', 'demo', {
          'demo/demo/index': { componentName: 'Demo', load: demoLoader }
        }),
        manifest('web-domain-hidden', 'hidden', {
          'hidden/index': { componentName: 'Hidden', load: hiddenLoader }
        })
      ],
      selectedDomainIds: ['demo'],
      selectedManifestIds: ['web-domain-demo']
    });

    expect(runtime.componentKeys()).toEqual(['demo/demo/index']);
    expect(runtime.resolve({ componentKey: 'demo/demo/index', domainId: 'demo' })).toMatchObject({
      componentName: 'Demo',
      load: demoLoader
    });
    expect(demoLoader).not.toHaveBeenCalled();
    expect(hiddenLoader).not.toHaveBeenCalled();
  });

  it('fails before a later manifest can overwrite a duplicate component key', () => {
    expect(() =>
      composeAppRuntime({
        appId: 'admin-web',
        domainModules: [domain('demo'), domain('alternate')],
        manifests: [
          manifest('web-domain-demo', 'demo', {
            'demo/demo/index': { componentName: 'Demo', load: async () => 'first' }
          }),
          manifest('web-domain-alternate', 'alternate', {
            'demo/demo/index': { componentName: 'Alternate', load: async () => 'second' }
          })
        ],
        selectedDomainIds: ['demo', 'alternate'],
        selectedManifestIds: ['web-domain-demo', 'web-domain-alternate']
      })
    ).toThrowError(
      expect.objectContaining({
        code: 'duplicate-component-key',
        appId: 'admin-web',
        domainId: 'alternate',
        componentKey: 'demo/demo/index',
        manifestId: 'web-domain-alternate',
        conflictingDomainId: 'demo',
        conflictingManifestId: 'web-domain-demo'
      })
    );
  });

  it('reports a stable missing component diagnostic with app, domain, and key', () => {
    const runtime = composeAppRuntime({
      appId: 'client-web',
      domainModules: [domain('demo')],
      manifests: [manifest('web-domain-demo', 'demo', {})],
      selectedDomainIds: ['demo'],
      selectedManifestIds: ['web-domain-demo']
    });

    expect(() => runtime.resolve({ componentKey: 'demo/missing/index', domainId: 'demo' })).toThrowError(
      expect.objectContaining({
        code: 'missing-component-key',
        appId: 'client-web',
        domainId: 'demo',
        componentKey: 'demo/missing/index'
      })
    );
  });

  it('rejects selected web domains whose headless domain is unselected', () => {
    expect(() =>
      composeAppRuntime({
        appId: 'client-web',
        domainModules: [domain('demo')],
        manifests: [manifest('web-domain-demo', 'demo', {})],
        selectedDomainIds: [],
        selectedManifestIds: ['web-domain-demo']
      })
    ).toThrowError(
      expect.objectContaining({
        code: 'unselected-domain',
        appId: 'client-web',
        domainId: 'demo',
        componentKey: '*'
      })
    );
  });

  it('rejects a selected manifest that is not available to the App', () => {
    expect(() =>
      composeAppRuntime({
        appId: 'admin-web',
        domainModules: [domain('demo')],
        manifests: [],
        selectedDomainIds: ['demo'],
        selectedManifestIds: ['web-domain-demo']
      })
    ).toThrowError(AppRuntimeError);
  });
});
