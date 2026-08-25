import type { Component } from 'vue';
import { demoDomainModule } from '@namewta/domain-demo';
import { identityAccessDomainModule, type IdentityAccessService } from '@namewta/domain-identity-access';
import { createWorkflowDefinitionService, workflowDomainModule } from '@namewta/domain-workflow';
import { AppRuntimeError, composeAppRuntime, type WebComponentRegistration } from '@namewta/platform-app-runtime';
import { createDemoWebDomain, type DemoWebRuntime } from '@namewta/web-domain-demo';
import { createIdentityAccessWebDomain } from '@namewta/web-domain-identity-access';
import { createLiveWorkflowDictRefs, createWorkflowWebDomain } from '@namewta/web-domain-workflow';

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

const workflowService = createWorkflowDefinitionService({
  async request<T>(config) {
    const { default: request } = await import('@/utils/request');
    return request(config) as Promise<T>;
  }
});
const workflowManifest = createWorkflowWebDomain({
  service: workflowService,
  confirm: async message => {
    const { default: modal } = await import('@/plugins/modal');
    await modal.confirm(message);
  },
  success: message => {
    void import('@/plugins/modal').then(({ default: modal }) => modal.msgSuccess(message));
  },
  error: message => {
    void import('@/plugins/modal').then(({ default: modal }) => modal.msgError(message));
  },
  dicts: (...types) =>
    createLiveWorkflowDictRefs(types, () => import('@/utils/dict').then(({ useDict }) => useDict(...types))),
  download: (url, params, fileName) =>
    import('@/utils/request').then(({ download }) => download(url, params, fileName)),
  closeDesigner: async activeName => {
    const { default: tab } = await import('@/plugins/tab');
    await tab.closeOpenPage({
      path: '/workflow/processDefinition',
      query: { activeName }
    });
  },
  designUrl: async (definitionId, disabled) => {
    const { getToken } = await import('@/utils/auth');
    return (
      import.meta.env.VITE_APP_BASE_API +
      '/warm-flow-ui/index.html?id=' +
      encodeURIComponent(definitionId) +
      '&onlyDesignShow=' +
      String(disabled) +
      '&Authorization=Bearer ' +
      encodeURIComponent(getToken() ?? '') +
      '&clientid=' +
      encodeURIComponent(import.meta.env.VITE_APP_CLIENT_ID)
    );
  }
});

const runtime = composeAppRuntime<Component>({
  appId: 'admin-web',
  domainModules: [identityAccessDomainModule, demoDomainModule, workflowDomainModule],
  manifests: [
    createIdentityAccessWebDomain({
      service: identityService,
      onAuthenticated: () => {
        window.location.href = `${import.meta.env.VITE_APP_CONTEXT_PATH}index`;
      }
    }),
    createDemoWebDomain(demoRuntime),
    workflowManifest
  ],
  selectedDomainIds: ['identity-access', 'demo', 'workflow'],
  selectedManifestIds: ['web-domain-identity-access', 'web-domain-demo', 'web-domain-workflow']
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
