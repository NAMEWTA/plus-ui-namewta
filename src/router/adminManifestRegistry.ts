import { aiDomainModule, createAiService } from '@namewta/domain-ai';
import { demoDomainModule } from '@namewta/domain-demo';
import { identityAccessDomainModule, type IdentityAccessService } from '@namewta/domain-identity-access';
import { createSystemAdminService, systemAdminDomainModule } from '@namewta/domain-system-admin';
import { createWorkflowDefinitionService, workflowDomainModule } from '@namewta/domain-workflow';
import { AppRuntimeError, composeAppRuntime, type WebComponentRegistration } from '@namewta/platform-app-runtime';
import { createAccessEvaluator } from '@namewta/platform-permission';
import { createAiWebDomain, type AiWebRuntime } from '@namewta/web-domain-ai';
import { createDemoWebDomain, type DemoWebRuntime } from '@namewta/web-domain-demo';
import { createIdentityAccessWebDomain } from '@namewta/web-domain-identity-access';
import {
  createLiveSystemDictRefs,
  createSystemAdminWebDomain,
  type SystemAdminWebRuntime
} from '@namewta/web-domain-system-admin';
import { createLiveWorkflowDictRefs, createWorkflowWebDomain } from '@namewta/web-domain-workflow';
import { getActivePinia } from 'pinia';
import { defineAsyncComponent, type Component } from 'vue';
import WorkflowTreePanel from '@/components/TreePanel/index.vue';
import { getToken } from '@/utils/auth';
import { sanitizeHtml } from '@/utils/sanitize';

const WorkflowFileUpload = defineAsyncComponent(() => import('@/components/FileUpload/index.vue'));
const SystemEditor = defineAsyncComponent(() => import('@/components/Editor/index.vue'));
const SystemImagePreview = defineAsyncComponent(() => import('@/components/ImagePreview/index.vue'));

const aiService = createAiService({
  async request<T>(config) {
    const { default: request } = await import('@/utils/request');
    return request(config) as Promise<T>;
  }
});

async function cancelUnreadResponseBody(response: Response | undefined): Promise<void> {
  const body = response?.body;
  if (!body || response.bodyUsed || body.locked) return;
  try {
    await body.cancel();
  } catch {
    // Probe outcome must not be replaced by a best-effort transport cleanup failure.
  }
}

export const adminAiWebRuntime: AiWebRuntime = {
  baseUrl: () => import.meta.env.VITE_APP_BASE_API,
  probeFrame: async ({ signal, url }) => {
    let response: Response | undefined;
    try {
      response = await fetch(url, { credentials: 'same-origin', method: 'GET', redirect: 'error', signal });
      const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
      if (!response.ok || (contentType !== 'text/html' && contentType !== 'application/xhtml+xml')) {
        throw new Error('AI chat probe failed');
      }
    } finally {
      await cancelUnreadResponseBody(response);
    }
  },
  service: aiService,
  trustedCredential: () => getToken() ?? null
};
const aiManifest = createAiWebDomain(adminAiWebRuntime);

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
export const adminWorkflowWebRuntime = {
  service: workflowService,
  fileUpload: WorkflowFileUpload,
  closeCurrentPage: () => import('@/plugins/tab').then(({ default: tab }) => tab.closePage()),
  chartUrl: async instanceId => {
    const { getToken } = await import('@/utils/auth');
    return (
      import.meta.env.VITE_APP_BASE_API +
      `/warm-flow-ui/index.html?id=${encodeURIComponent(instanceId)}&type=FlowChart&t=${Date.now()}` +
      '&Authorization=Bearer ' +
      encodeURIComponent(getToken() ?? '') +
      '&clientid=' +
      encodeURIComponent(import.meta.env.VITE_APP_CLIENT_ID)
    );
  },
  resolveAttachments: async ids => {
    const { listByIds } = await import('@/api/system/oss');
    const response = await listByIds(ids);
    return response.data.map(item => ({ ossId: item.ossId, originalName: item.originalName }));
  },
  downloadAttachment: ossId => import('@/plugins/download').then(({ default: download }) => download.oss(ossId)),
  confirm: async message => {
    const { default: modal } = await import('@/plugins/modal');
    await modal.confirm(message);
  },
  success: message => {
    void import('@/plugins/modal').then(({ default: modal }) => modal.msgSuccess(message));
  },
  treePanel: WorkflowTreePanel,
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
};
const workflowManifest = createWorkflowWebDomain(adminWorkflowWebRuntime);

const systemAdminService = createSystemAdminService({
  async request<T>(config) {
    const { default: request } = await import('@/utils/request');
    return request(config) as Promise<T>;
  }
});
export const adminSystemAdminWebRuntime: SystemAdminWebRuntime = {
  service: systemAdminService,
  treePanel: WorkflowTreePanel,
  editor: SystemEditor,
  imagePreview: SystemImagePreview,
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
  warning: message => {
    void import('@/plugins/modal').then(({ default: modal }) => modal.msgWarning(message));
  },
  download: (url, params, fileName) =>
    import('@/utils/request').then(({ download }) => download(url, params, fileName)),
  downloadOss: ossId => import('@/plugins/download').then(({ default: download }) => download.oss(ossId)),
  dictCache: {
    clean: () => {
      void import('@/store/modules/dict').then(({ useDictStore }) => useDictStore().cleanDict());
    },
    remove: type => {
      void import('@/store/modules/dict').then(({ useDictStore }) => useDictStore().removeDict(type));
    }
  },
  sanitizeHtml,
  replaceOssContentUrls: (html, urls) =>
    import('@/utils/ossContent').then(({ replaceOssContentUrls }) => replaceOssContentUrls(html, urls)),
  dicts: (...types) =>
    createLiveSystemDictRefs(types, () => import('@/utils/dict').then(({ useDict }) => useDict(...types))),
  closeCurrentPage: () => import('@/plugins/tab').then(({ default: tab }) => tab.closePage()),
  closeAndOpenPage: location => import('@/plugins/tab').then(({ default: tab }) => tab.closeOpenPage(location)),
  config: key =>
    import('@/api/system/config').then(({ getConfigKey }) => getConfigKey(key).then(response => response.data)),
  hasPermission: permission => {
    const user = getActivePinia()?.state.value.user as { permissions?: string[]; roles?: string[] } | undefined;
    return createAccessEvaluator({ permissions: user?.permissions ?? [], roles: user?.roles ?? [] }).hasAnyPermission([
      permission
    ]);
  },
  currentUserId: () => {
    const user = getActivePinia()?.state.value.user as { userId?: string | number } | undefined;
    return user?.userId;
  },
  uploadHeaders: () => ({
    Authorization: `Bearer ${getToken()}`,
    clientid: import.meta.env.VITE_APP_CLIENT_ID
  })
};
const systemAdminManifest = createSystemAdminWebDomain(adminSystemAdminWebRuntime);

const runtime = composeAppRuntime<Component>({
  appId: 'admin-web',
  domainModules: [
    identityAccessDomainModule,
    demoDomainModule,
    workflowDomainModule,
    systemAdminDomainModule,
    aiDomainModule
  ],
  manifests: [
    createIdentityAccessWebDomain({
      service: identityService,
      onAuthenticated: () => {
        window.location.href = `${import.meta.env.VITE_APP_CONTEXT_PATH}index`;
      }
    }),
    createDemoWebDomain(demoRuntime),
    workflowManifest,
    systemAdminManifest,
    aiManifest
  ],
  selectedDomainIds: ['identity-access', 'demo', 'workflow', 'system-admin', 'ai'],
  selectedManifestIds: [
    'web-domain-identity-access',
    'web-domain-demo',
    'web-domain-workflow',
    'web-domain-system-admin',
    'web-domain-ai'
  ]
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
