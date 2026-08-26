import type { WebDomainManifest } from '@namewta/platform-app-runtime';
import { defineComponent, h, type Component } from 'vue';
import type { DevtoolsWebRuntime } from './runtime';

export type { DevtoolsWebRuntime } from './runtime';

async function runtimeView(name: string, runtime: DevtoolsWebRuntime, load: () => Promise<{ default: Component }>) {
  const page = (await load()).default;
  return defineComponent({ name, setup: () => () => h(page, { runtime }) });
}

export function createDevtoolsWebDomain(runtime: DevtoolsWebRuntime): WebDomainManifest<Component> {
  return Object.freeze({
    id: 'web-domain-devtools',
    domainId: 'devtools',
    messages: Object.freeze([]),
    permissions: Object.freeze([
      Object.freeze({
        id: 'devtools-generator',
        permissions: Object.freeze([
          'tool:gen:list',
          'tool:gen:query',
          'tool:gen:code',
          'tool:gen:import',
          'tool:gen:edit',
          'tool:gen:remove',
          'tool:gen:preview'
        ])
      })
    ]),
    registrations: Object.freeze([
      Object.freeze({
        id: 'devtools-generator',
        componentKey: 'tool/gen/index',
        componentName: 'Gen',
        load: () => runtimeView('Gen', runtime, () => import('./views/GeneratorPage.vue'))
      }),
      Object.freeze({
        id: 'devtools-generator-edit',
        componentKey: 'tool/gen-edit/index',
        componentName: 'GenEdit',
        load: () => runtimeView('GenEdit', runtime, () => import('./views/GeneratorEditPage.vue'))
      })
    ])
  });
}
