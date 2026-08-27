import type { HttpClient, HttpRequest } from '@namewta/platform-contracts';
import type { ApiResponse, PageResult } from './index';
import type {
  ConfigForm,
  ConfigQuery,
  ConfigVO,
  DictDataForm,
  DictDataQuery,
  DictDataVO,
  DictTypeForm,
  DictTypeQuery,
  DictTypeVO,
  MessageBoxVO,
  NoticeForm,
  NoticeQuery,
  NoticeVO,
  OssCompletedPart,
  OssConfigForm,
  OssConfigQuery,
  OssConfigVO,
  OssDownloadUrl,
  OssQuery,
  OssSignedPart,
  OssUploadInitRequest,
  OssUploadInitResponse,
  OssUploadResumeResponse,
  OssVO,
  ResourceIdentifier,
  ResourceIdentifierList,
  SocialAuthVO
} from './resource-types';

export * from './resource-types';

const segment = (value: ResourceIdentifierList) =>
  (Array.isArray(value) ? value : [value]).map(item => encodeURIComponent(String(item))).join(',');

export class ResourceSecurityError extends Error {
  readonly code = 'unsafe-resource-url';
  constructor() {
    super('资源地址不可用');
    this.name = 'ResourceSecurityError';
  }
}

function requireSafeUrl(value: string) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new ResourceSecurityError();
    return value;
  } catch (error) {
    if (error instanceof ResourceSecurityError) throw error;
    throw new ResourceSecurityError();
  }
}

function validatePresigned<T extends { url: string }>(request: T): T {
  requireSafeUrl(request.url);
  return request;
}

export interface SystemResourceService {
  dictData: ReturnType<typeof createDictDataService>;
  dictTypes: ReturnType<typeof createDictTypeService>;
  configs: ReturnType<typeof createConfigService>;
  notices: ReturnType<typeof createNoticeService>;
  oss: ReturnType<typeof createOssService>;
  ossConfigs: ReturnType<typeof createOssConfigService>;
  messages: { box(): Promise<ApiResponse<MessageBoxVO>> };
  social: {
    list(): Promise<ApiResponse<SocialAuthVO[]>>;
  };
}

type Request = <T = unknown>(config: HttpRequest) => Promise<ApiResponse<T>>;

function createDictDataService(request: Request) {
  return Object.freeze({
    byType: (type: string) => request<DictDataVO[]>({ url: '/system/dict/data/type/' + segment(type), method: 'get' }),
    list: (params: DictDataQuery) =>
      request<PageResult<DictDataVO>>({ url: '/system/dict/data/list', method: 'get', params }),
    get: (id: ResourceIdentifier) => request<DictDataVO>({ url: '/system/dict/data/' + segment(id), method: 'get' }),
    add: (data: DictDataForm) => request({ url: '/system/dict/data', method: 'post', data }),
    update: (data: DictDataForm) => request({ url: '/system/dict/data', method: 'put', data }),
    delete: (ids: ResourceIdentifierList) => request({ url: '/system/dict/data/' + segment(ids), method: 'delete' })
  });
}

function createDictTypeService(request: Request) {
  return Object.freeze({
    list: (params: DictTypeQuery) =>
      request<PageResult<DictTypeVO>>({ url: '/system/dict/type/list', method: 'get', params }),
    get: (id: ResourceIdentifier) => request<DictTypeVO>({ url: '/system/dict/type/' + segment(id), method: 'get' }),
    add: (data: DictTypeForm) => request({ url: '/system/dict/type', method: 'post', data }),
    update: (data: DictTypeForm) => request({ url: '/system/dict/type', method: 'put', data }),
    delete: (ids: ResourceIdentifierList) => request({ url: '/system/dict/type/' + segment(ids), method: 'delete' }),
    refreshCache: () => request({ url: '/system/dict/type/refreshCache', method: 'delete' }),
    options: () => request<DictTypeVO[]>({ url: '/system/dict/type/optionselect', method: 'get' })
  });
}

function createConfigService(request: Request) {
  return Object.freeze({
    list: (params: ConfigQuery) => request<PageResult<ConfigVO>>({ url: '/system/config/list', method: 'get', params }),
    get: (id: ResourceIdentifier) => request<ConfigVO>({ url: '/system/config/' + segment(id), method: 'get' }),
    byKey: (key: string) => request<string>({ url: '/system/config/configKey/' + segment(key), method: 'get' }),
    add: (data: ConfigForm) => request({ url: '/system/config', method: 'post', data }),
    update: (data: ConfigForm) => request({ url: '/system/config', method: 'put', data }),
    updateByKey: (key: string, value: unknown) =>
      request({ url: '/system/config/updateByKey', method: 'put', data: { configKey: key, configValue: value } }),
    delete: (ids: ResourceIdentifierList) => request({ url: '/system/config/' + segment(ids), method: 'delete' }),
    refreshCache: () => request({ url: '/system/config/refreshCache', method: 'delete' })
  });
}

function createNoticeService(request: Request) {
  return Object.freeze({
    list: (params: NoticeQuery) => request<PageResult<NoticeVO>>({ url: '/system/notice/list', method: 'get', params }),
    get: (id: ResourceIdentifier) => request<NoticeVO>({ url: '/system/notice/' + segment(id), method: 'get' }),
    attachmentUrls: async (id: ResourceIdentifier) => {
      const response = await request<Record<string, OssDownloadUrl>>({
        url: `/system/notice/${segment(id)}/attachments/download-urls`,
        method: 'get'
      });
      Object.values(response.data).forEach(item => requireSafeUrl(item.url));
      return response;
    },
    add: (data: NoticeForm) => request({ url: '/system/notice', method: 'post', data }),
    update: (data: NoticeForm) => request({ url: '/system/notice', method: 'put', data }),
    delete: (ids: ResourceIdentifierList) => request({ url: '/system/notice/' + segment(ids), method: 'delete' })
  });
}

function createOssService(request: Request) {
  const downloadUrl = async (id: ResourceIdentifier) => {
    const response = await request<OssDownloadUrl>({ url: `/resource/oss/${segment(id)}/download-url`, method: 'get' });
    requireSafeUrl(response.data.url);
    return response;
  };
  return Object.freeze({
    list: (params: OssQuery) => request<PageResult<OssVO>>({ url: '/resource/oss/list', method: 'get', params }),
    listByIds: async (ids: ResourceIdentifierList) => {
      const response = await request<OssVO[]>({ url: '/resource/oss/listByIds/' + segment(ids), method: 'get' });
      const data = await Promise.all(
        response.data.map(async item => {
          const resolved = await downloadUrl(item.ossId);
          return { ...item, url: resolved.data.url };
        })
      );
      return { ...response, data };
    },
    initUpload: async (data: OssUploadInitRequest) => {
      const response = await request<OssUploadInitResponse>({ url: '/resource/oss/uploads', method: 'post', data });
      if (response.data.presignedRequest) validatePresigned(response.data.presignedRequest);
      return response;
    },
    signParts: async (token: string, partNumbers: number[]) => {
      const response = await request<{ parts: OssSignedPart[] }>({
        url: `/resource/oss/uploads/${segment(token)}/parts/sign`,
        method: 'post',
        data: { partNumbers }
      });
      response.data.parts.forEach(validatePresigned);
      return response;
    },
    resumeUpload: async (token: string, fingerprint: string) => {
      const response = await request<OssUploadResumeResponse>({
        url: `/resource/oss/uploads/${segment(token)}/parts`,
        method: 'get',
        params: { fingerprint }
      });
      if (response.data.presignedRequest) validatePresigned(response.data.presignedRequest);
      return response;
    },
    completeUpload: (token: string, parts: OssCompletedPart[] = []) =>
      request<string>({ url: `/resource/oss/uploads/${segment(token)}/complete`, method: 'post', data: { parts } }),
    abortUpload: (token: string) => request({ url: `/resource/oss/uploads/${segment(token)}`, method: 'delete' }),
    downloadUrl,
    delete: (ids: ResourceIdentifierList) => request({ url: '/resource/oss/' + segment(ids), method: 'delete' })
  });
}

function createOssConfigService(request: Request) {
  return Object.freeze({
    list: (params: OssConfigQuery) =>
      request<PageResult<OssConfigVO>>({ url: '/resource/oss/config/list', method: 'get', params }),
    get: (id: ResourceIdentifier) =>
      request<OssConfigVO>({ url: '/resource/oss/config/' + segment(id), method: 'get' }),
    add: (data: OssConfigForm) => request({ url: '/resource/oss/config', method: 'post', data }),
    update: (data: OssConfigForm) => request({ url: '/resource/oss/config', method: 'put', data }),
    delete: (ids: ResourceIdentifierList) => request({ url: '/resource/oss/config/' + segment(ids), method: 'delete' }),
    changeStatus: (ossConfigId: ResourceIdentifier, status: string, configKey: string) =>
      request({ url: '/resource/oss/config/changeStatus', method: 'put', data: { ossConfigId, status, configKey } })
  });
}

export function createSystemResourceService(http: HttpClient): SystemResourceService {
  const request: Request = config => http.request(config);
  return Object.freeze({
    dictData: createDictDataService(request),
    dictTypes: createDictTypeService(request),
    configs: createConfigService(request),
    notices: createNoticeService(request),
    oss: createOssService(request),
    ossConfigs: createOssConfigService(request),
    messages: Object.freeze({ box: () => request<MessageBoxVO>({ url: '/resource/message/box', method: 'get' }) }),
    social: Object.freeze({
      list: () => request<SocialAuthVO[]>({ url: '/system/social/list', method: 'get' })
    })
  });
}
