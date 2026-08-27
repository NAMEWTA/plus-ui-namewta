import { aiDomainModule } from '@namewta/domain-ai';
import { demoDomainModule } from '@namewta/domain-demo';
import { devtoolsDomainModule } from '@namewta/domain-devtools';
import { identityAccessDomainModule } from '@namewta/domain-identity-access';
import { operationsDomainModule } from '@namewta/domain-operations';
import { systemAdminDomainModule } from '@namewta/domain-system-admin';
import { workflowDomainModule } from '@namewta/domain-workflow';
import { AppRuntimeError, composeAppRuntime, type WebComponentRegistration } from '@namewta/platform-app-runtime';
import { createAiWebDomain, type AiWebRuntime } from '@namewta/web-domain-ai';
import { createDemoWebDomain, type DemoWebRuntime } from '@namewta/web-domain-demo';
import { createDevtoolsWebDomain, type DevtoolsWebRuntime } from '@namewta/web-domain-devtools';
import { createIdentityAccessWebDomain } from '@namewta/web-domain-identity-access';
import {
  createLiveOperationsDictRefs,
  createOperationsWebDomain,
  type OperationsWebRuntime
} from '@namewta/web-domain-operations';
import {
  createLiveSystemDictRefs,
  createSystemAdminWebDomain,
  type SystemAdminWebRuntime
} from '@namewta/web-domain-system-admin';
import { createLiveWorkflowDictRefs, createWorkflowWebDomain } from '@namewta/web-domain-workflow';
import { getActivePinia } from 'pinia';
import { defineAsyncComponent, type Component } from 'vue';
import { createAdminAccessEvaluator } from '@/application/access';
import {
  aiService,
  demoService,
  devtoolsService,
  identityAccessService,
  operationsService,
  systemAdminService,
  workflowService
} from '@/application/services';
import { getToken } from '@/application/session';
import IFrame from '@/components/iFrame/index.vue';
import WorkflowTreePanel from '@/components/TreePanel/index.vue';
import { sanitizeHtml } from '@/utils/sanitize';

const WorkflowFileUpload = defineAsyncComponent(() => import('@/components/FileUpload/index.vue'));
const SystemEditor = defineAsyncComponent(() => import('@/components/Editor/index.vue'));
const SystemImagePreview = defineAsyncComponent(() => import('@/components/ImagePreview/index.vue'));

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

const demoRuntime: DemoWebRuntime = {
  service: demoService,
  confirm: message =>
    import('@/application/host/feedback').then(({ default: modal }) => modal.confirm(message).then(() => undefined)),
  download: (url, params, fileName) =>
    import('@/application/http').then(({ download }) => download(url, params, fileName)),
  success: message => void import('@/application/host/feedback').then(({ default: modal }) => modal.msgSuccess(message))
};

export const adminWorkflowWebRuntime = {
  service: workflowService,
  fileUpload: WorkflowFileUpload,
  closeCurrentPage: () => import('@/application/host/navigation').then(({ default: tab }) => tab.closePage()),
  chartUrl: async instanceId => {
    const { getToken } = await import('@/application/session');
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
    const response = await systemAdminService.resources.oss.listByIds(ids);
    return response.data.map(item => ({ ossId: item.ossId, originalName: item.originalName }));
  },
  downloadAttachment: ossId =>
    import('@/application/host/download').then(({ default: download }) => download.oss(ossId)),
  confirm: async message => {
    const { default: modal } = await import('@/application/host/feedback');
    await modal.confirm(message);
  },
  success: message => {
    void import('@/application/host/feedback').then(({ default: modal }) => modal.msgSuccess(message));
  },
  treePanel: WorkflowTreePanel,
  error: message => {
    void import('@/application/host/feedback').then(({ default: modal }) => modal.msgError(message));
  },
  dicts: (...types) =>
    createLiveWorkflowDictRefs(types, () => import('@/utils/dict').then(({ useDict }) => useDict(...types))),
  download: (url, params, fileName) =>
    import('@/application/http').then(({ download }) => download(url, params, fileName)),
  closeDesigner: async activeName => {
    const { default: tab } = await import('@/application/host/navigation');
    await tab.closeOpenPage({
      path: '/workflow/processDefinition',
      query: { activeName }
    });
  },
  designUrl: async (definitionId, disabled) => {
    const { getToken } = await import('@/application/session');
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

export const adminSystemAdminWebRuntime: SystemAdminWebRuntime = {
  service: systemAdminService,
  treePanel: WorkflowTreePanel,
  editor: SystemEditor,
  imagePreview: SystemImagePreview,
  confirm: async message => {
    const { default: modal } = await import('@/application/host/feedback');
    await modal.confirm(message);
  },
  success: message => {
    void import('@/application/host/feedback').then(({ default: modal }) => modal.msgSuccess(message));
  },
  error: message => {
    void import('@/application/host/feedback').then(({ default: modal }) => modal.msgError(message));
  },
  warning: message => {
    void import('@/application/host/feedback').then(({ default: modal }) => modal.msgWarning(message));
  },
  download: (url, params, fileName) =>
    import('@/application/http').then(({ download }) => download(url, params, fileName)),
  downloadOss: ossId => import('@/application/host/download').then(({ default: download }) => download.oss(ossId)),
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
  closeCurrentPage: () => import('@/application/host/navigation').then(({ default: tab }) => tab.closePage()),
  closeAndOpenPage: location =>
    import('@/application/host/navigation').then(({ default: tab }) => tab.closeOpenPage(location)),
  config: key => systemAdminService.resources.configs.byKey(key).then(response => response.data),
  hasPermission: permission => createAdminAccessEvaluator().hasPermission(permission),
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

export const adminOperationsWebRuntime: OperationsWebRuntime = {
  service: operationsService,
  iframe: IFrame,
  externalUrls: Object.freeze({
    'monitor-admin': import.meta.env.VITE_APP_MONITOR_ADMIN,
    'snail-job': import.meta.env.VITE_APP_SNAILJOB_ADMIN,
    'snail-ai': import.meta.env.VITE_APP_SNAILAI_ADMIN
  }),
  confirm: async message => {
    const { default: modal } = await import('@/application/host/feedback');
    await modal.confirm(message);
  },
  success: message => {
    void import('@/application/host/feedback').then(({ default: modal }) => modal.msgSuccess(message));
  },
  error: message => {
    void import('@/application/host/feedback').then(({ default: modal }) => modal.msgError(message));
  },
  loading: message => {
    void import('@/application/host/feedback').then(({ default: modal }) => modal.loading(message));
  },
  closeLoading: () => {
    void import('@/application/host/feedback').then(({ default: modal }) => modal.closeLoading());
  },
  download: (url, params, fileName) =>
    import('@/application/http').then(({ download }) => download(url, params, fileName)),
  openDownload: intent => {
    const link = document.createElement('a');
    link.href = intent.url;
    link.rel = 'noopener noreferrer';
    link.download = intent.downloadName ?? '';
    link.style.display = 'none';
    document.body.append(link);
    link.click();
    link.remove();
  },
  dicts: (...types) =>
    createLiveOperationsDictRefs(types, () => import('@/utils/dict').then(({ useDict }) => useDict(...types))),
  hasPermission: permission => createAdminAccessEvaluator().hasPermission(permission)
};
const operationsManifest = createOperationsWebDomain(adminOperationsWebRuntime);

export const adminDevtoolsWebRuntime: DevtoolsWebRuntime = {
  service: devtoolsService,
  clientId: () => import.meta.env.VITE_APP_CLIENT_ID,
  confirm: async message => {
    const { default: modal } = await import('@/application/host/feedback');
    await modal.confirm(message);
  },
  success: message => {
    void import('@/application/host/feedback').then(({ default: modal }) => modal.msgSuccess(message));
  },
  error: message => {
    void import('@/application/host/feedback').then(({ default: modal }) => modal.msgError(message));
  },
  navigate: async location => {
    const { default: appRouter } = await import('@/router');
    await appRouter.push(location);
  },
  closeAndOpenPage: location =>
    import('@/application/host/navigation').then(({ default: tab }) => tab.closeOpenPage(location)),
  downloadZip: (url, fileName) =>
    import('@/application/host/download').then(({ default: download }) => download.zip(url, fileName))
};
const devtoolsManifest = createDevtoolsWebDomain(adminDevtoolsWebRuntime);

const runtime = composeAppRuntime<Component>({
  appId: 'admin-web',
  domainModules: [
    identityAccessDomainModule,
    demoDomainModule,
    devtoolsDomainModule,
    workflowDomainModule,
    systemAdminDomainModule,
    aiDomainModule,
    operationsDomainModule
  ],
  manifests: [
    createIdentityAccessWebDomain({
      service: identityAccessService,
      onAuthenticated: () => {
        window.location.href = `${import.meta.env.VITE_APP_CONTEXT_PATH}index`;
      }
    }),
    createDemoWebDomain(demoRuntime),
    devtoolsManifest,
    workflowManifest,
    systemAdminManifest,
    aiManifest,
    operationsManifest
  ],
  selectedDomainIds: ['identity-access', 'demo', 'devtools', 'workflow', 'system-admin', 'ai', 'operations'],
  selectedManifestIds: [
    'web-domain-identity-access',
    'web-domain-demo',
    'web-domain-devtools',
    'web-domain-workflow',
    'web-domain-system-admin',
    'web-domain-ai',
    'web-domain-operations'
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
