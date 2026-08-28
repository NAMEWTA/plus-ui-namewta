import { createIdentityAccessService } from '@namewta/domain-admin';
import { createAiService } from '@namewta/domain-ai';
import { createDemoService } from '@namewta/domain-demo';
import { createSystemService } from '@namewta/domain-system';
import { createMonitorService } from '@namewta/domain-system/monitor';
import { createWorkflowDefinitionService } from '@namewta/domain-workflow';
import { adminHttp } from './http';
import { session } from './session';

type AdminDomainRequest = Parameters<typeof adminHttp.request>[0];

// 延迟读取适配器，避免 HTTP 恢复逻辑、Router 清单与服务组合形成初始化环。
const domainHttp = {
  request: <T>(config: AdminDomainRequest) => adminHttp.request<T>(config)
};

export const systemService = createSystemService(domainHttp);

export const identityAccessService = createIdentityAccessService({
  client: { clientId: import.meta.env.VITE_APP_CLIENT_ID },
  encryptLoginRequest: import.meta.env.VITE_APP_ENCRYPT === 'true',
  http: domainHttp,
  identity: systemService.identity,
  session
});

export const workflowService = createWorkflowDefinitionService(domainHttp);
export const demoService = createDemoService(domainHttp);
export const monitorService = createMonitorService(domainHttp);
export const aiService = createAiService(domainHttp);
