import type { Component } from 'vue';
import { adminDomainModule } from '@namewta/domain-admin';
import { demoDomainModule } from '@namewta/domain-demo';
import { systemDomainModule } from '@namewta/domain-system';
import { composeAppRuntime, type AppRuntime, type WebDomainManifest } from '@namewta/platform-app-runtime';
import { createAdminWebDomain, type IdentityAccessWebRuntime } from '@namewta/web-domain-admin';
import { createDemoWebDomain, type DemoWebRuntime } from '@namewta/web-domain-demo';

export interface ClientCompositionDependencies {
  demo: DemoWebRuntime;
  identity: IdentityAccessWebRuntime;
}

export const clientCompositionManifest = Object.freeze({
  appId: 'client-web',
  selectedDomainIds: Object.freeze(['admin', 'system', 'demo']),
  selectedManifestIds: Object.freeze(['web-domain-admin', 'web-domain-demo'])
});

export function composeClientRuntime({ demo, identity }: ClientCompositionDependencies): AppRuntime<Component> {
  const manifests: readonly WebDomainManifest<Component>[] = [
    createAdminWebDomain(identity),
    createDemoWebDomain(demo)
  ];
  return composeAppRuntime({
    ...clientCompositionManifest,
    domainModules: [adminDomainModule, systemDomainModule, demoDomainModule],
    manifests
  });
}
