import type { WebDomainManifest } from '@namewta/platform-app-runtime';
import { defineComponent, h, type Component } from 'vue';
import type { WorkflowWebRuntime } from './runtime';
import { requireWorkflowWebRuntime } from './runtime';

export type { WorkflowWebRuntime } from './runtime';

async function runtimeView(
  name: string,
  runtime: WorkflowWebRuntime,
  load: () => Promise<{ default: Component }>
): Promise<Component> {
  const page = (await load()).default;
  return defineComponent({ name, setup: () => () => h(page, { runtime }) });
}

export function createWorkflowWebDomain(runtimeInput: WorkflowWebRuntime | undefined): WebDomainManifest<Component> {
  const runtime = requireWorkflowWebRuntime(runtimeInput);
  return Object.freeze({
    id: 'web-domain-workflow',
    domainId: 'workflow',
    messages: Object.freeze([
      Object.freeze({
        namespace: 'workflow',
        messages: Object.freeze({
          categoryTitle: '流程分类',
          definitionTitle: '流程定义',
          spelTitle: '流程表达式'
        })
      })
    ]),
    permissions: Object.freeze([
      Object.freeze({
        id: 'workflow-category',
        permissions: Object.freeze([
          'workflow:category:list',
          'workflow:category:query',
          'workflow:category:add',
          'workflow:category:edit',
          'workflow:category:remove'
        ])
      }),
      Object.freeze({
        id: 'workflow-definition',
        permissions: Object.freeze([
          'workflow:definition:list',
          'workflow:definition:add',
          'workflow:definition:edit',
          'workflow:definition:remove',
          'workflow:definition:import',
          'workflow:definition:export',
          'workflow:definition:active',
          'workflow:definition:copy',
          'workflow:definition:query',
          'workflow:definition:publish'
        ])
      }),
      Object.freeze({
        id: 'workflow-spel',
        permissions: Object.freeze([
          'workflow:spel:list',
          'workflow:spel:query',
          'workflow:spel:add',
          'workflow:spel:edit',
          'workflow:spel:remove'
        ])
      })
    ]),
    registrations: Object.freeze([
      Object.freeze({
        id: 'workflow-category',
        componentKey: 'workflow/category/index',
        componentName: 'Category',
        load: () => runtimeView('Category', runtime, () => import('./views/CategoryPage.vue'))
      }),
      Object.freeze({
        id: 'workflow-definition',
        componentKey: 'workflow/processDefinition/index',
        componentName: 'processDefinition',
        load: () => runtimeView('processDefinition', runtime, () => import('./views/DefinitionPage.vue'))
      }),
      Object.freeze({
        id: 'workflow-definition-design',
        componentKey: 'workflow/processDefinition/design',
        componentName: 'WarmFlow',
        load: () => runtimeView('WarmFlow', runtime, () => import('./views/DesignPage.vue'))
      }),
      Object.freeze({
        id: 'workflow-spel',
        componentKey: 'workflow/spel/index',
        componentName: 'Spel',
        load: () => runtimeView('Spel', runtime, () => import('./views/SpelPage.vue'))
      })
    ])
  });
}
