import type { AppRuntime } from '@namewta/platform-app-runtime';
import type { CryptoPort, HttpClient, SessionStore } from '@namewta/platform-contracts';
import type { Component, InjectionKey, Ref } from 'vue';
import type { Router } from 'vue-router';
import { createAxiosBrowserAdapter } from '@namewta/adapter-axios-browser';
import { createBrowserCryptoAdapter } from '@namewta/adapter-crypto-browser';
import { createBrowserSessionStore } from '@namewta/adapter-storage-browser';
import { createDemoService } from '@namewta/domain-demo';
import { createClientSessionKey, createIdentityAccessService } from '@namewta/domain-identity-access';
import { ref } from 'vue';
import type { ClientWebConfig } from './config';
import { composeClientRuntime } from './composition';
import { createClientRouter } from './router';

export interface ClientApplication {
  authenticated: Ref<boolean>;
  clientId: string;
  router: Router;
  runtime: AppRuntime<Component>;
  sessionKey: string;
  transportMessage: Ref<string>;
}

export const clientApplicationKey: InjectionKey<ClientApplication> = Symbol('client-application');

const serializeParams = (params: unknown): string => {
  if (!params || typeof params !== 'object' || Array.isArray(params)) return '';
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach(item => result.append(key, String(item)));
    else result.append(key, String(value));
  }
  return result.toString();
};

const errorMessage = (code: unknown): string | undefined => {
  if (code === 401) return '登录状态已过期';
  if (code === 500) return '服务暂时不可用';
  if (code === 601) return '请求需要确认';
  if (code === 'default') return '请求失败，请稍后重试';
  return undefined;
};

const createCrypto = (config: ClientWebConfig): CryptoPort | undefined => {
  if (!config.loginEncryption) return undefined;
  return createBrowserCryptoAdapter({
    publicKey: config.requestPublicKey ?? '',
    privateKey: config.responsePrivateKey ?? ''
  });
};

const isolatedSessionStorage = Object.freeze({
  getItem: (key: string) => globalThis.sessionStorage.getItem(key),
  removeItem: (key: string) => globalThis.sessionStorage.removeItem(key),
  setItem: (key: string, value: string) => globalThis.sessionStorage.setItem(key, value)
});

const saveDownload = (data: Blob, fileName: string) => {
  const url = URL.createObjectURL(data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

function createDemoRuntime(http: HttpClient, transportMessage: Ref<string>) {
  return {
    service: createDemoService(http),
    confirm: async (message: string) => {
      if (!globalThis.confirm(message)) throw new Error('Operation cancelled');
    },
    download: async (url: string, params: unknown, fileName: string) => {
      const data = await http.request<Blob>({ url, method: 'post', data: params, responseType: 'blob' });
      saveDownload(data, fileName);
    },
    success: (message: string) => {
      transportMessage.value = message;
    }
  };
}

export function createClientApplication(config: ClientWebConfig): ClientApplication {
  const sessionKey = createClientSessionKey('client-web', config.client.clientId);
  const session: SessionStore = createBrowserSessionStore({ key: sessionKey, storage: isolatedSessionStorage });
  const authenticated = ref(Boolean(session.getToken()));
  const transportMessage = ref('');
  let router: Router;
  let repeatSubmission: { data: unknown; time: number; url?: string } | undefined;

  const http = createAxiosBrowserAdapter({
    baseURL: config.apiBaseUrl,
    client: config.client,
    crypto: createCrypto(config),
    encryptionEnabled: config.loginEncryption,
    errorPresenter: {
      confirmSessionExpired: async () => undefined,
      present: error => {
        transportMessage.value = error.message;
      }
    },
    getLanguage: () => document.documentElement.lang || 'zh-CN',
    getToken: session.getToken,
    onUnauthorized: async () => {
      session.clear();
      authenticated.value = false;
      await router.replace('/login');
    },
    repeatSubmissions: {
      get: () => repeatSubmission,
      set: value => {
        repeatSubmission = value;
      }
    },
    resolveErrorCode: errorMessage,
    serializeParams,
    successCode: 200
  });
  const identityService = createIdentityAccessService({
    client: config.client,
    encryptLoginRequest: config.loginEncryption,
    http,
    session
  });
  const runtime = composeClientRuntime({
    identity: {
      service: identityService,
      onAuthenticated: async () => {
        authenticated.value = true;
        await router.push('/demo');
      }
    },
    demo: createDemoRuntime(http, transportMessage)
  });
  router = createClientRouter(runtime, authenticated);

  return Object.freeze({
    authenticated,
    clientId: config.client.clientId,
    router,
    runtime,
    sessionKey,
    transportMessage
  });
}
