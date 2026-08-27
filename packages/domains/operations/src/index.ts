import type { DomainModule } from '@namewta/platform-app-runtime';
import type { HttpClient, HttpRequest } from '@namewta/platform-contracts';

export * from './transport';
import type {
  ApiResponse,
  CacheVO,
  Identifier,
  IdentifierList,
  LoginInfoQuery,
  LoginInfoVO,
  NotifyDetailVO,
  NotifyListVO,
  NotifyQuery,
  OnlineQuery,
  OnlineVO,
  OperLogQuery,
  OperLogVO,
  OssDownloadUrl,
  PageResult
} from './types';

export * from './types';

export type ExternalOperationTarget = 'monitor-admin' | 'snail-job' | 'snail-ai';
export interface NavigationIntent {
  readonly target: ExternalOperationTarget | 'notify-attachment';
  readonly url: string;
  readonly mode: 'embed' | 'download';
  readonly downloadName?: string;
}
export type OperationsSecurityCode = 'permission-denied' | 'unsafe-url' | 'missing-url';
export class OperationsSecurityError extends Error {
  constructor(
    readonly code: OperationsSecurityCode,
    message: string
  ) {
    super(message);
    this.name = 'OperationsSecurityError';
  }
}

const targetPermissions: Readonly<Record<ExternalOperationTarget, string>> = Object.freeze({
  'monitor-admin': 'monitor:admin:list',
  'snail-job': 'monitor:snailjob:list',
  'snail-ai': 'monitor:snailai:list'
});
const segment = (value: IdentifierList) =>
  (Array.isArray(value) ? value : [value]).map(item => encodeURIComponent(String(item))).join(',');
const relativeUrlBase = 'https://operations.invalid';
const invalidPercentEncoding = /%(?![\dA-Fa-f]{2})/;
const unsafeWhitespace = /\s/u;
const safeUrl = (rawUrl: string | undefined) => {
  if (!rawUrl) throw new OperationsSecurityError('missing-url', '未配置运维入口地址');
  const hasControlCharacter = [...rawUrl].some(
    character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127
  );
  if (
    rawUrl !== rawUrl.trim() ||
    unsafeWhitespace.test(rawUrl) ||
    rawUrl.includes('\\') ||
    hasControlCharacter ||
    invalidPercentEncoding.test(rawUrl)
  )
    throw new OperationsSecurityError('unsafe-url', '运维入口地址不安全');
  try {
    if (rawUrl.startsWith('/')) {
      if (rawUrl.startsWith('//')) throw new OperationsSecurityError('unsafe-url', '运维入口地址不安全');
      const parsed = new URL(rawUrl, relativeUrlBase);
      if (parsed.origin !== relativeUrlBase) throw new OperationsSecurityError('unsafe-url', '运维入口地址不安全');
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
      throw new OperationsSecurityError('unsafe-url', '运维入口地址不安全');
    }
    return parsed.href;
  } catch (error) {
    if (error instanceof OperationsSecurityError) throw error;
    throw new OperationsSecurityError('unsafe-url', '运维入口地址不安全');
  }
};

export interface OperationsService {
  readonly cache: { get(): Promise<ApiResponse<CacheVO>> };
  readonly loginInfo: {
    list(query: LoginInfoQuery): Promise<ApiResponse<PageResult<LoginInfoVO>>>;
    delete(ids: IdentifierList): Promise<ApiResponse>;
    unlock(userNames: string | readonly string[]): Promise<ApiResponse>;
    clean(): Promise<ApiResponse>;
  };
  readonly notifications: {
    list(query: NotifyQuery): Promise<ApiResponse<PageResult<NotifyListVO>>>;
    get(id: Identifier): Promise<ApiResponse<NotifyDetailVO>>;
    attachmentUrl(id: Identifier, ossId: Identifier): Promise<ApiResponse<OssDownloadUrl>>;
    delete(ids: IdentifierList): Promise<ApiResponse>;
    clean(): Promise<ApiResponse>;
  };
  readonly online: {
    list(query: OnlineQuery): Promise<ApiResponse<PageResult<OnlineVO>>>;
    forceLogout(tokenId: string): Promise<ApiResponse>;
    current(): Promise<ApiResponse<PageResult<OnlineVO>>>;
    removeCurrent(tokenId: string): Promise<ApiResponse>;
  };
  readonly operationLogs: {
    list(query: OperLogQuery): Promise<ApiResponse<PageResult<OperLogVO>>>;
    delete(ids: IdentifierList): Promise<ApiResponse>;
    clean(): Promise<ApiResponse>;
  };
  externalIntent(target: ExternalOperationTarget, rawUrl: string | undefined, allowed: boolean): NavigationIntent;
  attachmentIntent(rawUrl: string | undefined, allowed: boolean, downloadName?: string): NavigationIntent;
}

export const operationsDomainModule: DomainModule = Object.freeze({
  id: 'operations',
  backendModules: Object.freeze(['ruoyi-system']),
  capabilities: Object.freeze([
    'online',
    'cache',
    'monitor-admin',
    'snail-job',
    'snail-ai',
    'operation-log',
    'login-info',
    'notification-log'
  ])
});

export function createOperationsService(http: HttpClient): OperationsService {
  const request = <T = unknown>(config: HttpRequest) => http.request<ApiResponse<T>>(config);
  const requirePermission = (allowed: boolean) => {
    if (!allowed) throw new OperationsSecurityError('permission-denied', '无权访问运维入口');
  };
  return Object.freeze({
    cache: Object.freeze({ get: () => request<CacheVO>({ url: '/monitor/cache', method: 'get' }) }),
    loginInfo: Object.freeze({
      list: (params: LoginInfoQuery) =>
        request<PageResult<LoginInfoVO>>({ url: '/monitor/loginInfo/list', method: 'get', params }),
      delete: (ids: IdentifierList) => request({ url: '/monitor/loginInfo/' + segment(ids), method: 'delete' }),
      unlock: (names: string | readonly string[]) =>
        request({ url: '/monitor/loginInfo/unlock/' + segment(names), method: 'get' }),
      clean: () => request({ url: '/monitor/loginInfo/clean', method: 'delete' })
    }),
    notifications: Object.freeze({
      list: (params: NotifyQuery) =>
        request<PageResult<NotifyListVO>>({ url: '/monitor/notify/list', method: 'get', params }),
      get: (id: Identifier) => request<NotifyDetailVO>({ url: '/monitor/notify/' + segment(id), method: 'get' }),
      attachmentUrl: (id: Identifier, ossId: Identifier) =>
        request<OssDownloadUrl>({
          url: `/monitor/notify/${segment(id)}/attachments/${segment(ossId)}/download-url`,
          method: 'get'
        }),
      delete: (ids: IdentifierList) => request({ url: '/monitor/notify/' + segment(ids), method: 'delete' }),
      clean: () => request({ url: '/monitor/notify/clean', method: 'delete' })
    }),
    online: Object.freeze({
      list: (params: OnlineQuery) =>
        request<PageResult<OnlineVO>>({ url: '/monitor/online/list', method: 'get', params }),
      forceLogout: (tokenId: string) => request({ url: '/monitor/online/' + segment(tokenId), method: 'delete' }),
      current: () => request<PageResult<OnlineVO>>({ url: '/monitor/online', method: 'get' }),
      removeCurrent: (tokenId: string) =>
        request({ url: '/monitor/online/myself/' + segment(tokenId), method: 'delete' })
    }),
    operationLogs: Object.freeze({
      list: (params: OperLogQuery) =>
        request<PageResult<OperLogVO>>({ url: '/monitor/operlog/list', method: 'get', params }),
      delete: (ids: IdentifierList) => request({ url: '/monitor/operlog/' + segment(ids), method: 'delete' }),
      clean: () => request({ url: '/monitor/operlog/clean', method: 'delete' })
    }),
    externalIntent(target: ExternalOperationTarget, rawUrl: string | undefined, allowed: boolean) {
      requirePermission(allowed);
      return Object.freeze({ target, url: safeUrl(rawUrl), mode: 'embed' as const });
    },
    attachmentIntent(rawUrl: string | undefined, allowed: boolean, downloadName?: string) {
      requirePermission(allowed);
      return Object.freeze({
        target: 'notify-attachment' as const,
        url: safeUrl(rawUrl),
        mode: 'download' as const,
        downloadName
      });
    }
  });
}

export const operationsPermissions = Object.freeze({ ...targetPermissions });
