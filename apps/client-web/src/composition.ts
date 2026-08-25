import type { Component } from 'vue';
import { demoDomainModule } from '@namewta/domain-demo';
import { identityAccessDomainModule } from '@namewta/domain-identity-access';
import { composeAppRuntime, type AppRuntime, type WebDomainManifest } from '@namewta/platform-app-runtime';
import { createDemoWebDomain, type DemoWebRuntime } from '@namewta/web-domain-demo';
import { createIdentityAccessWebDomain, type IdentityAccessWebRuntime } from '@namewta/web-domain-identity-access';

export interface ClientCompositionDependencies {
  demo: DemoWebRuntime;
  identity: IdentityAccessWebRuntime;
}

export const clientCompositionManifest = Object.freeze({
  appId: 'client-web',
  selectedDomainIds: Object.freeze(['identity-access', 'demo']),
  selectedManifestIds: Object.freeze(['web-domain-identity-access', 'web-domain-demo'])
});

export function composeClientRuntime({ demo, identity }: ClientCompositionDependencies): AppRuntime<Component> {
  const manifests: readonly WebDomainManifest<Component>[] = [
    createIdentityAccessWebDomain(identity),
    createDemoWebDomain(demo)
  ];
  return composeAppRuntime({
    ...clientCompositionManifest,
    domainModules: [identityAccessDomainModule, demoDomainModule],
    manifests
  });
}
