import type { DomainModule } from '@namewta/platform-app-runtime';
import type { HttpClient } from '@namewta/platform-contracts';

export * from './transport';

export interface SnailOpenApiUser {
  openId: string;
  nickname?: string;
  externalId?: string;
  created?: boolean;
}

export interface AiApiResponse<T = unknown> {
  code?: number;
  data?: T;
  msg?: string;
}

export interface AiService {
  registerCurrentSnailUser(): Promise<AiApiResponse<SnailOpenApiUser>>;
}

export const aiDomainModule: DomainModule = Object.freeze({
  id: 'ai',
  backendModules: Object.freeze(['ruoyi-ai']),
  capabilities: Object.freeze(['embedded-chat'])
});

export function createAiService(http: HttpClient): AiService {
  return Object.freeze({
    registerCurrentSnailUser: () =>
      http.request<AiApiResponse<SnailOpenApiUser>>({
        url: '/snail-ai/user/register',
        method: 'post',
        headers: { repeatSubmit: false }
      })
  });
}
