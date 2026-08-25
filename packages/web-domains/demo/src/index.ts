import type { WebDomainManifest } from '@namewta/platform-app-runtime';
import { defineComponent, h, type Component } from 'vue';
import type { DemoWebRuntime } from './runtime';
import { requireDemoWebRuntime } from './runtime';

export type { DemoWebRuntime } from './runtime';

async function runtimeView(
  name: string,
  runtime: DemoWebRuntime,
  load: () => Promise<{ default: Component }>
): Promise<Component> {
  const page = (await load()).default;
  return defineComponent({
    name,
    setup: () => () => h(page, { runtime })
  });
}

export const loadDemoPage = (runtime: DemoWebRuntime) =>
  runtimeView('Demo', requireDemoWebRuntime(runtime), () => import('./views/DemoPage.vue'));

export const loadTreePage = (runtime: DemoWebRuntime) =>
  runtimeView('Tree', requireDemoWebRuntime(runtime), () => import('./views/TreePage.vue'));

export function createDemoWebDomain(runtimeInput: DemoWebRuntime | undefined): WebDomainManifest<Component> {
  const runtime = requireDemoWebRuntime(runtimeInput);
  return Object.freeze({
    id: 'web-domain-demo',
    domainId: 'demo',
    components: Object.freeze({
      'demo/demo/index': {
        componentName: 'Demo',
        load: () => loadDemoPage(runtime)
      },
      'demo/tree/index': {
        componentName: 'Tree',
        load: () => loadTreePage(runtime)
      }
    })
  });
}
