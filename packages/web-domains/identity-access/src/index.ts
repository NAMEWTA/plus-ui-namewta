import type { WebDomainManifest } from '@namewta/platform-app-runtime';
import { defineComponent, h, type Component } from 'vue';
import type { IdentityAccessWebRuntime } from './runtime';
import { requireIdentityAccessWebRuntime } from './runtime';

export type { IdentityAccessWebRuntime } from './runtime';

async function runtimeView(runtime: IdentityAccessWebRuntime): Promise<Component> {
  const page = (await import('./views/LoginPage.vue')).default;
  return defineComponent({
    name: 'IdentityLogin',
    setup: () => () => h(page, { runtime })
  });
}

export function createIdentityAccessWebDomain(
  runtimeInput: IdentityAccessWebRuntime | undefined
): WebDomainManifest<Component> {
  const runtime = requireIdentityAccessWebRuntime(runtimeInput);
  return Object.freeze({
    id: 'web-domain-identity-access',
    domainId: 'identity-access',
    messages: Object.freeze([
      Object.freeze({
        namespace: 'identity-access',
        messages: Object.freeze({
          title: '客户服务入口',
          unavailable: '客户端认证配置不可用，无法登录'
        })
      })
    ]),
    permissions: Object.freeze([Object.freeze({ id: 'identity-login', permissions: Object.freeze([] as string[]) })]),
    registrations: Object.freeze([
      Object.freeze({
        id: 'identity-login',
        componentKey: 'identity-access/login/index',
        componentName: 'IdentityLogin',
        load: () => runtimeView(runtime)
      })
    ])
  });
}
