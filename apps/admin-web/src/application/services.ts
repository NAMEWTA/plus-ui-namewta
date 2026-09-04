import { createIdentityAccessService } from '@namewta/domain-admin';
import { createAiService } from '@namewta/domain-ai';
import { createDemoService } from '@namewta/domain-demo';
import { createProfileService } from '@namewta/domain-profile';
import { createOpenApiService, createSystemService } from '@namewta/domain-system';
import { createMonitorService } from '@namewta/domain-system/monitor';
import { createWorkflowDefinitionService } from '@namewta/domain-workflow';
import { createThirdService } from '@namewta/domain-third';
import { createOssUploadClient, transferToOss, type OssTransfer } from '@namewta/adapter-oss-upload-browser';
import { adminHttp } from './http';
import { session } from './session';

type AdminDomainRequest = Parameters<typeof adminHttp.request>[0];

// 延迟读取适配器，避免 HTTP 恢复逻辑、Router 清单与服务组合形成初始化环。
const domainHttp = {
  request: <T>(config: AdminDomainRequest) => adminHttp.request<T>(config)
};

function createDevelopmentOssTransfer(): OssTransfer | undefined {
  const proxyPrefix = import.meta.env.VITE_APP_OSS_PROXY_PREFIX?.trim();
  if (!import.meta.env.DEV || !proxyPrefix || typeof window === 'undefined') return undefined;

  const normalizedPrefix = `/${proxyPrefix.replace(/^\/+|\/+$/g, '')}`;
  return (request, body, signal, onProgress) => {
    const signedUrl = new URL(request.url);
    const proxyUrl = new URL(`${normalizedPrefix}${signedUrl.pathname}${signedUrl.search}`, window.location.origin);
    return transferToOss({ ...request, url: proxyUrl.toString() }, body, signal, onProgress);
  };
}

export const systemService = createSystemService(domainHttp);
export const openApiService = createOpenApiService(domainHttp);

export const ossUploadClient = createOssUploadClient({
  clientId: import.meta.env.VITE_APP_CLIENT_ID,
  gateway: systemService.resources.oss,
  getToken: session.getToken,
  transfer: createDevelopmentOssTransfer()
});

export const identityAccessService = createIdentityAccessService({
  client: { clientId: import.meta.env.VITE_APP_CLIENT_ID },
  encryptLoginRequest: import.meta.env.VITE_APP_ENCRYPT === 'true',
  http: domainHttp,
  identity: systemService.identity,
  session
});

export const workflowService = createWorkflowDefinitionService(domainHttp);
export const profileService = createProfileService(domainHttp);
export const demoService = createDemoService(domainHttp);
export const monitorService = createMonitorService(domainHttp);
export const aiService = createAiService(domainHttp);
export const thirdService = createThirdService(domainHttp);
