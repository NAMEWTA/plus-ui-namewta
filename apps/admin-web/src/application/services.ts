import { createAiService } from '@namewta/domain-ai';
import { createDemoService } from '@namewta/domain-demo';
import { createDevtoolsService } from '@namewta/domain-devtools';
import { createIdentityAccessService } from '@namewta/domain-identity-access';
import { createOperationsService } from '@namewta/domain-operations';
import { createDictTypeCatalogPort } from '@namewta/domain-system-admin/public/dict';
import { createMenuQueryPort } from '@namewta/domain-system-admin/public/menu';
import { createSystemAdminService } from '@namewta/domain-system-admin';
import { createWorkflowDefinitionService } from '@namewta/domain-workflow';
import { adminHttp } from './http';
import { session } from './session';

type AdminDomainRequest = Parameters<typeof adminHttp.request>[0];

// 延迟读取适配器，避免 HTTP 恢复逻辑、Router 清单与服务组合形成初始化环。
const domainHttp = {
  request: <T>(config: AdminDomainRequest) => adminHttp.request<T>(config)
};

export const identityAccessService = createIdentityAccessService({
  client: { clientId: import.meta.env.VITE_APP_CLIENT_ID },
  encryptLoginRequest: import.meta.env.VITE_APP_ENCRYPT === 'true',
  http: domainHttp,
  session
});

export const systemAdminService = createSystemAdminService(domainHttp);
export const workflowService = createWorkflowDefinitionService(domainHttp);
export const demoService = createDemoService(domainHttp);
export const operationsService = createOperationsService(domainHttp);
export const aiService = createAiService(domainHttp);
export const devtoolsService = createDevtoolsService(domainHttp, {
  dictTypes: createDictTypeCatalogPort(domainHttp),
  menus: createMenuQueryPort(domainHttp)
});
