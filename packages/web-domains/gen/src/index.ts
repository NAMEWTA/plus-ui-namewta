import type { WebDomainManifest } from '@namewta/platform-app-runtime';
import { defineComponent, h, type Component } from 'vue';
import type { GenWebRuntime } from './runtime';

export type { GenWebRuntime } from './runtime';

async function runtimeView(name: string, runtime: GenWebRuntime, load: () => Promise<{ default: Component }>) {
  const page = (await load()).default;
  return defineComponent({ name, setup: () => () => h(page, { runtime }) });
}

export function createGenWebDomain(runtime: GenWebRuntime): WebDomainManifest<Component> {
  return Object.freeze({
    id: 'web-domain-gen',
    domainId: 'gen',
    messages: Object.freeze([]),
    permissions: Object.freeze([
      Object.freeze({
        id: 'gen-generator',
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
        id: 'gen-generator',
        componentKey: 'tool/gen/index',
        componentName: 'Gen',
        load: () => runtimeView('Gen', runtime, () => import('./generator/GeneratorPage.vue'))
      }),
      Object.freeze({
        id: 'gen-generator-edit',
        componentKey: 'tool/gen-edit/index',
        componentName: 'GenEdit',
        load: () => runtimeView('GenEdit', runtime, () => import('./generator/GeneratorEditPage.vue'))
      })
    ])
  });
}
