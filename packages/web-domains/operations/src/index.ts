import type { ExternalOperationTarget } from '@namewta/domain-operations';
import type { WebDomainManifest } from '@namewta/platform-app-runtime';
import { defineComponent, h, type Component } from 'vue';
import type { OperationsWebRuntime } from './runtime';
import ExternalMonitorPage from './views/ExternalMonitorPage.vue';
export { createLiveOperationsDictRefs, type OperationsDictOption, type OperationsWebRuntime } from './runtime';

async function runtimeView(name: string, runtime: OperationsWebRuntime, load: () => Promise<{ default: Component }>) {
  const page = (await load()).default;
  return defineComponent({ name, setup: () => () => h(page, { runtime }) });
}
function externalView(name: string, target: ExternalOperationTarget, runtime: OperationsWebRuntime) {
  return defineComponent({ name, setup: () => () => h(ExternalMonitorPage, { runtime, target }) });
}
export function createOperationsWebDomain(runtime: OperationsWebRuntime): WebDomainManifest<Component> {
  const registrations = [
    [
      'operations-online',
      'monitor/online/index',
      'Online',
      () => runtimeView('Online', runtime, () => import('./views/OnlinePage.vue'))
    ],
    [
      'operations-cache',
      'monitor/cache/index',
      'Cache',
      () => runtimeView('Cache', runtime, () => import('./views/CachePage.vue'))
    ],
    [
      'operations-admin',
      'monitor/admin/index',
      'MonitorAdmin',
      async () => externalView('MonitorAdmin', 'monitor-admin', runtime)
    ],
    [
      'operations-snailjob',
      'monitor/snailjob/index',
      'SnailJob',
      async () => externalView('SnailJob', 'snail-job', runtime)
    ],
    [
      'operations-snailai',
      'monitor/snailai/index',
      'SnailAi',
      async () => externalView('SnailAi', 'snail-ai', runtime)
    ],
    [
      'operations-operlog',
      'monitor/operlog/index',
      'Operlog',
      () => runtimeView('Operlog', runtime, () => import('./views/OperationLogPage.vue'))
    ],
    [
      'operations-logininfo',
      'monitor/logininfo/index',
      'LoginInfo',
      () => runtimeView('LoginInfo', runtime, () => import('./views/LoginInfoPage.vue'))
    ],
    [
      'operations-notify',
      'monitor/notify/index',
      'NotifyMonitor',
      () => runtimeView('NotifyMonitor', runtime, () => import('./views/NotificationPage.vue'))
    ]
  ] as const;
  const permissions = {
    online: ['list', 'query', 'batchLogout', 'forceLogout'],
    cache: ['list'],
    admin: ['list'],
    snailjob: ['list'],
    snailai: ['list'],
    operlog: ['list', 'query', 'remove', 'export'],
    logininfo: ['list', 'query', 'remove', 'unlock', 'export']
  } as const;
  return Object.freeze({
    id: 'web-domain-operations',
    domainId: 'operations',
    messages: Object.freeze([]),
    permissions: Object.freeze([
      ...Object.entries(permissions).map(([slice, actions]) =>
        Object.freeze({
          id: `operations-${slice}`,
          permissions: Object.freeze(actions.map(action => `monitor:${slice}:${action}`))
        })
      ),
      Object.freeze({
        id: 'operations-notify',
        permissions: Object.freeze(['system:notify:list', 'system:notify:query', 'system:notify:remove'])
      })
    ]),
    registrations: Object.freeze(
      registrations.map(([id, componentKey, componentName, load]) =>
        Object.freeze({ id, componentKey, componentName, load })
      )
    )
  });
}
