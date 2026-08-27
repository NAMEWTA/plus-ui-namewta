import { AppRuntimeError, type AppRuntime } from '@namewta/platform-app-runtime';
import { defineComponent, h, type Component } from 'vue';

export interface DemoRouteAdapter {
  load(componentKey: string): Promise<Component>;
}

export function formatDemoManifestError(error: AppRuntimeError): string {
  return `页面组件不可用 [${error.code}] app=${error.appId} domain=${error.domainId} key=${error.componentKey}`;
}

function createDemoManifestErrorView(error: AppRuntimeError): Component {
  const message = formatDemoManifestError(error);
  return defineComponent({
    name: 'DemoManifestError',
    setup: () => () =>
      h('main', { class: 'app-container', role: 'alert', 'data-testid': 'demo-manifest-error' }, [
        h('h1', '页面加载失败'),
        h('p', message)
      ])
  });
}

export function createDemoRouteAdapter(runtime: AppRuntime<Component>, domainId: string): DemoRouteAdapter {
  return Object.freeze({
    async load(componentKey: string): Promise<Component> {
      try {
        return await runtime.resolve({ componentKey, domainId }).load();
      } catch (error: unknown) {
        if (error instanceof AppRuntimeError && error.code === 'missing-component-key')
          return createDemoManifestErrorView(error);
        throw error;
      }
    }
  });
}
