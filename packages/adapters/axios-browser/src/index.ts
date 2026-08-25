import type { ClientContext, CryptoPort, ErrorPresenter, HttpClient, HttpRequest } from '@namewta/platform-contracts';
import {
  createHandledError,
  isHandledError,
  normalizeTransportMessage,
  payloadErrorMessage
} from '@namewta/platform-http';
import axiosModule from 'axios';

interface AxiosBrowserRequest {
  data?: unknown;
  headers: Record<string, unknown>;
  method?: string;
  params?: unknown;
  responseType?: string;
  url?: string;
}

interface AxiosBrowserResponse {
  config: AxiosBrowserRequest;
  data: unknown;
  headers: Record<string, unknown>;
  request?: { responseType?: string };
}

interface AxiosBrowserClient extends HttpClient {
  (config: unknown): Promise<unknown>;
  interceptors: {
    request: {
      use(fulfilled: (config: AxiosBrowserRequest) => AxiosBrowserRequest | Promise<never>): unknown;
    };
    response: {
      use(fulfilled: (response: AxiosBrowserResponse) => unknown, rejected: (error: unknown) => unknown): unknown;
    };
  };
  post(url: string, data: unknown, config: unknown): Promise<unknown>;
  request<T>(config: HttpRequest): Promise<T>;
}

interface AxiosBrowserFactory {
  create(config: unknown): AxiosBrowserClient;
}

const axios = axiosModule as unknown as AxiosBrowserFactory;
const encryptHeader = 'encrypt-key';

export interface RepeatSubmission {
  data: unknown;
  time: number;
  url?: string;
}

export interface RepeatSubmissionStore {
  get(): RepeatSubmission | null | undefined;
  set(value: RepeatSubmission): void;
}

export interface AxiosBrowserOptions {
  baseURL: string;
  client: ClientContext;
  crypto?: CryptoPort;
  encryptionEnabled: boolean;
  errorPresenter: ErrorPresenter;
  getLanguage(): string;
  getToken(): string | null;
  now?: () => number;
  onUnauthorized(): void;
  repeatSubmissions: RepeatSubmissionStore;
  resolveErrorCode(code: unknown): string | undefined;
  serializeParams(params: unknown): string;
  successCode: number;
  timeout?: number;
}

async function responseDataMessage(data: unknown, resolveCode: (code: unknown) => string | undefined) {
  if (data instanceof Blob) return responseDataMessage(await data.text(), resolveCode);
  if (data instanceof ArrayBuffer) return responseDataMessage(new TextDecoder().decode(data), resolveCode);
  if (typeof data === 'string') {
    const text = data.trim();
    if (!text) return undefined;
    try {
      return responseDataMessage(JSON.parse(text), resolveCode);
    } catch {
      return text;
    }
  }
  return payloadErrorMessage(data, resolveCode);
}

export async function extractAxiosErrorMessage(
  error: unknown,
  resolveCode: (code: unknown) => string | undefined
): Promise<string | undefined> {
  const candidate = error as { message?: string; response?: { data?: unknown } };
  return (
    (await responseDataMessage(candidate.response?.data, resolveCode)) ?? normalizeTransportMessage(candidate.message)
  );
}

export function createAxiosBrowserAdapter(options: AxiosBrowserOptions): AxiosBrowserClient {
  if (typeof options.client.clientId !== 'string' || !options.client.clientId.trim()) {
    throw new Error('ClientContext.clientId is required');
  }
  const service = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout ?? 50000,
    headers: { 'Content-Type': 'application/json;charset=utf-8', clientid: options.client.clientId },
    transitional: { clarifyTimeoutError: true }
  });

  service.interceptors.request.use(config => {
    const headers = config.headers as unknown as Record<string, unknown>;
    headers['Content-Language'] = options.getLanguage();
    const token = options.getToken();
    if (token && headers.isToken !== false && headers.isToken !== 'false') headers.Authorization = `Bearer ${token}`;
    if (config.method === 'get' && config.params) {
      const query = options.serializeParams(config.params);
      config.url = `${config.url}?${query}`.replace(/[?&]$/, '');
      config.params = {};
    }
    const repeatDisabled = headers.repeatSubmit === false || headers.repeatSubmit === 'false';
    if (!repeatDisabled && (config.method === 'post' || config.method === 'put')) {
      const current = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: (options.now ?? Date.now)()
      };
      const previous = options.repeatSubmissions.get();
      if (
        previous &&
        previous.data === current.data &&
        current.time - previous.time < 500 &&
        previous.url === current.url
      )
        return Promise.reject(new Error('数据正在处理，请勿重复提交'));
      options.repeatSubmissions.set(current);
    }
    const shouldEncrypt = String(headers.isEncrypt) === 'true';
    if (options.encryptionEnabled && shouldEncrypt && (config.method === 'post' || config.method === 'put')) {
      if (!options.crypto) throw new Error('CryptoPort is required when request encryption is enabled');
      const encrypted = options.crypto.encryptRequest(
        typeof config.data === 'object' ? JSON.stringify(config.data) : String(config.data)
      );
      headers[encryptHeader] = encrypted.encryptedKey;
      config.data = encrypted.data;
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) delete headers['Content-Type'];
    return config;
  });

  service.interceptors.response.use(
    response => {
      const headers = response.headers as Record<string, unknown>;
      const encryptedKey = headers[encryptHeader];
      if (options.encryptionEnabled && typeof encryptedKey === 'string' && encryptedKey && options.crypto)
        response.data = options.crypto.decryptResponse(String(response.data), encryptedKey);
      const data = response.data as Record<string, unknown>;
      const code = Number(data?.code || options.successCode);
      const message =
        (typeof data?.msg === 'string' && data.msg) ||
        options.resolveErrorCode(code) ||
        options.resolveErrorCode('default') ||
        '';
      const responseType =
        (response.request as { responseType?: string } | undefined)?.responseType ?? response.config.responseType;
      if (responseType === 'blob' || responseType === 'arraybuffer') return response.data;
      if (code === 401) {
        options.onUnauthorized();
        return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
      }
      if (code !== options.successCode) {
        const kind = code === 500 ? 'server' : code === 601 ? 'warning' : 'business';
        options.errorPresenter.present({ kind, message });
        return Promise.reject(createHandledError(message));
      }
      return response.data;
    },
    async error => {
      const message =
        (await extractAxiosErrorMessage(error, options.resolveErrorCode)) || options.resolveErrorCode('default') || '';
      options.errorPresenter.present({ kind: 'network', message });
      (error as { isHandled?: boolean }).isHandled = true;
      return Promise.reject(error);
    }
  );
  return service;
}

export { isHandledError };

export interface DownloadOptions {
  client: AxiosBrowserClient;
  close(): void;
  fileName: string;
  isValid(data: unknown): boolean;
  onError(error: unknown): void;
  params: unknown;
  presentError(message: string): void;
  resolveErrorCode(code: unknown): string | undefined;
  save(data: Blob, fileName: string): void;
  serializeParams(params: unknown): string;
  url: string;
}

export async function downloadWithAxios(options: DownloadOptions): Promise<void> {
  try {
    const data = (await options.client.post(options.url, options.params, {
      transformRequest: [params => options.serializeParams(params)],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob'
    })) as unknown;
    const blob = new Blob([data as BlobPart]);
    if (options.isValid(data)) options.save(blob, options.fileName);
    else {
      const payload = JSON.parse(await blob.text()) as Record<string, unknown>;
      options.presentError(options.resolveErrorCode(payload.code) || String(payload.msg || '') || '系统未知错误');
    }
  } catch (error) {
    options.onError(error);
  } finally {
    options.close();
  }
}
