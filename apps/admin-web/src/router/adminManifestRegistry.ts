import { adminDomainModule, requirePasswordPolicy, validatePassword } from '@namewta/domain-admin';
import { aiDomainModule } from '@namewta/domain-ai';
import { demoDomainModule } from '@namewta/domain-demo';
import { systemDomainModule } from '@namewta/domain-system';
import { workflowDomainModule } from '@namewta/domain-workflow';
import {
  AppRuntimeError,
  composeAppRuntime,
  type WebComponentRegistration,
  type WebDomainManifest
} from '@namewta/platform-app-runtime';
import { createAdminWebDomain } from '@namewta/web-domain-admin';
import { createAiWebDomain, type AiWebRuntime } from '@namewta/web-domain-ai';
import { createDemoWebDomain, type DemoWebRuntime } from '@namewta/web-domain-demo';
import { createLiveMonitorDictRefs, createMonitorWebDomain, type MonitorWebRuntime } from '@namewta/web-domain-system';
import { createLiveSystemDictRefs, createSystemWebDomain, type SystemWebRuntime } from '@namewta/web-domain-system';
import { createLiveWorkflowDictRefs, createWorkflowWebDomain } from '@namewta/web-domain-workflow';
import { getActivePinia } from 'pinia';
import { defineAsyncComponent, defineComponent, h, type Component } from 'vue';
import { createAdminAccessEvaluator } from '@/application/access';
import {
  aiService,
  demoService,
  identityAccessService,
  monitorService,
  systemService,
  workflowService
} from '@/application/services';
import { getToken } from '@/application/session';
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
    const response = await systemService.resources.oss.listByIds(ids);
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

export const adminSystemWebRuntime: SystemWebRuntime = {
  service: systemService,
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
  config: key => systemService.resources.configs.byKey(key).then(response => response.data),
  hasPermission: permission => createAdminAccessEvaluator().hasPermission(permission),
  currentUserId: () => {
    const user = getActivePinia()?.state.value.user as { userId?: string | number } | undefined;
    return user?.userId;
  },
  passwordPolicy: {
    load: async () => requirePasswordPolicy(await identityAccessService.getClientContext()),
    validate: (policy, password) => validatePassword(policy, password)
  },
  copyText: async value => {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(value);
  },
  uploadHeaders: () => ({
    Authorization: `Bearer ${getToken()}`,
    clientid: import.meta.env.VITE_APP_CLIENT_ID
  })
};
const systemManifest = createSystemWebDomain(adminSystemWebRuntime);

export const adminMonitorWebRuntime: MonitorWebRuntime = {
  service: monitorService,
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
    createLiveMonitorDictRefs(types, () => import('@/utils/dict').then(({ useDict }) => useDict(...types))),
  hasPermission: permission => createAdminAccessEvaluator().hasPermission(permission)
};
const monitorManifest = createMonitorWebDomain(adminMonitorWebRuntime);
const AdminExternalMonitorPage = defineAsyncComponent(() => import('@/views/monitor/external/index.vue'));
const adminExternalMonitorManifest: WebDomainManifest<Component> = Object.freeze({
  id: 'admin-external-monitor',
  domainId: 'system',
  messages: Object.freeze([]),
  permissions: Object.freeze(
    ['admin', 'snailjob', 'snailai'].map(slice =>
      Object.freeze({ id: `admin-monitor-${slice}`, permissions: Object.freeze([`monitor:${slice}:list`]) })
    )
  ),
  registrations: Object.freeze(
    (
      [
        ['admin-monitor-admin', 'monitor/admin/index', 'MonitorAdmin', 'monitor-admin'],
        ['admin-monitor-snailjob', 'monitor/snailjob/index', 'SnailJob', 'snail-job'],
        ['admin-monitor-snailai', 'monitor/snailai/index', 'SnailAi', 'snail-ai']
      ] as const
    ).map(([id, componentKey, componentName, target]) =>
      Object.freeze({
        id,
        componentKey,
        componentName,
        load: async () =>
          defineComponent({ name: componentName, setup: () => () => h(AdminExternalMonitorPage, { target }) })
      })
    )
  )
});

const runtime = composeAppRuntime<Component>({
  appId: 'admin-web',
  domainModules: [
    adminDomainModule,
    demoDomainModule,
    workflowDomainModule,
    systemDomainModule,
    aiDomainModule
  ],
  manifests: [
    createAdminWebDomain({
      service: identityAccessService,
      onAuthenticated: () => {
        window.location.href = `${import.meta.env.VITE_APP_CONTEXT_PATH}index`;
      }
    }),
    createDemoWebDomain(demoRuntime),
    workflowManifest,
    systemManifest,
    aiManifest,
    monitorManifest,
    adminExternalMonitorManifest
  ],
  selectedDomainIds: ['admin', 'demo', 'workflow', 'system', 'ai'],
  selectedManifestIds: [
    'web-domain-admin',
    'web-domain-demo',
    'web-domain-workflow',
    'web-domain-system',
    'web-domain-ai',
    'web-domain-system-monitor',
    'admin-external-monitor'
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
