import type { AppRuntime, WebComponentRegistration } from '@namewta/platform-app-runtime';
import { AppRuntimeError } from '@namewta/platform-app-runtime';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, type Component } from 'vue';
import { createDemoRouteAdapter, formatDemoManifestError } from './routeAdapter';

const component = defineComponent({ name: 'ResolvedDemo', setup: () => () => null });

const runtime = (resolve: AppRuntime<Component>['resolve']): AppRuntime<Component> => ({
  appId: 'admin-web',
  componentKeys: () => [],
  messages: () => [],
  permissionContributions: () => [],
  resolve,
  webRegistrations: () => []
});

describe('demo manifest route adapter', () => {
  it('loads valid routes through the runtime registry', async () => {
    const load = vi.fn(async () => component);
    const resolve = vi.fn((): WebComponentRegistration<Component> => ({ componentName: 'Demo', load }));
    const adapter = createDemoRouteAdapter(runtime(resolve), 'demo');

    await expect(adapter.load('demo/demo/index')).resolves.toBe(component);
    expect(resolve).toHaveBeenCalledWith({ componentKey: 'demo/demo/index', domainId: 'demo' });
    expect(load).toHaveBeenCalledOnce();
  });

  it('turns a missing registry key into a stable visible diagnostic component', async () => {
    const error = new AppRuntimeError({
      appId: 'admin-web',
      code: 'missing-component-key',
      componentKey: 'demo/missing/index',
      domainId: 'demo'
    });
    const adapter = createDemoRouteAdapter(
      runtime(() => {
        throw error;
      }),
      'demo'
    );

    const result = await adapter.load('demo/missing/index');
    expect(result).toMatchObject({ name: 'DemoManifestError' });
    expect(formatDemoManifestError(error)).toBe(
      '页面组件不可用 [missing-component-key] app=admin-web domain=demo key=demo/missing/index'
    );
  });

  it('does not disguise loader failures as missing registry keys', async () => {
    const failure = new Error('loader failed');
    const adapter = createDemoRouteAdapter(
      runtime(() => ({ componentName: 'Demo', load: async () => Promise.reject(failure) })),
      'demo'
    );

    await expect(adapter.load('demo/demo/index')).rejects.toBe(failure);
  });
});
