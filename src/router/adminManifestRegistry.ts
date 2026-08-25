import type { Component } from 'vue';
import { demoDomainModule } from '@namewta/domain-demo';
import { identityAccessDomainModule, type IdentityAccessService } from '@namewta/domain-identity-access';
import { AppRuntimeError, composeAppRuntime, type WebComponentRegistration } from '@namewta/platform-app-runtime';
import { createDemoWebDomain, type DemoWebRuntime } from '@namewta/web-domain-demo';
import { createIdentityAccessWebDomain } from '@namewta/web-domain-identity-access';

const identityService: IdentityAccessService = {
  client: Object.freeze({ clientId: import.meta.env.VITE_APP_CLIENT_ID }),
  async login(input) {
    const { identityAccessService } = await import('@/api/login');
    return identityAccessService.login(input);
  },
  async prepareLogin() {
    const { identityAccessService } = await import('@/api/login');
    return identityAccessService.prepareLogin();
  }
};

const loadDemoRuntime = async () => (await import('@/views/demo/runtime')).demoWebRuntime;
const demoService = new Proxy({} as DemoWebRuntime['service'], {
  get:
    (_target, property) =>
    (...args: unknown[]) =>
      loadDemoRuntime().then(runtime => {
        const method = runtime.service[property as keyof DemoWebRuntime['service']] as (...input: unknown[]) => unknown;
        return method(...args);
      })
});
const demoRuntime: DemoWebRuntime = {
  service: demoService,
  confirm: message => loadDemoRuntime().then(runtime => runtime.confirm(message)),
  download: (...args) => loadDemoRuntime().then(runtime => runtime.download(...args)),
  success: message => {
    void loadDemoRuntime().then(runtime => runtime.success(message));
  }
};

const runtime = composeAppRuntime<Component>({
  appId: 'admin-web',
  domainModules: [identityAccessDomainModule, demoDomainModule],
  manifests: [
    createIdentityAccessWebDomain({
      service: identityService,
      onAuthenticated: () => {
        window.location.href = `${import.meta.env.VITE_APP_CONTEXT_PATH}index`;
      }
    }),
    createDemoWebDomain(demoRuntime)
  ],
  selectedDomainIds: ['identity-access', 'demo'],
  selectedManifestIds: ['web-domain-identity-access', 'web-domain-demo']
});

export function resolveAdminWebRegistration(
  componentKey: string,
  domainId: string
): WebComponentRegistration<Component> | undefined {
  try {
    return runtime.resolve({ componentKey, domainId });
  } catch (error: unknown) {
    if (
      error instanceof AppRuntimeError &&
      (error.code === 'missing-component-key' || error.code === 'unselected-domain')
    ) {
      return undefined;
    }
    throw error;
  }
}
