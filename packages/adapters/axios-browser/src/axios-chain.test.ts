import type { CryptoPort, ErrorPresenter } from '@namewta/platform-contracts';
import axiosModule from 'axios';
import { describe, expect, it, vi } from 'vitest';
import type { AxiosBrowserOptions, RepeatSubmission } from './index';
import { createAxiosBrowserAdapter } from './index';

type AxiosChainClient = {
  request<T>(config: Record<string, unknown>): Promise<T>;
};

const AxiosErrorConstructor = (
  axiosModule as unknown as {
    AxiosError: new (message: string, code: string, config: unknown) => Error;
  }
).AxiosError;

function chainOptions(overrides: Partial<AxiosBrowserOptions> = {}): AxiosBrowserOptions {
  let repeatSubmission: RepeatSubmission | null = null;
  const presenter: ErrorPresenter = {
    confirmSessionExpired: vi.fn().mockResolvedValue(undefined),
    present: vi.fn()
  };
  return {
    baseURL: '/prod-api',
    client: { clientId: 'client-a' },
    encryptionEnabled: false,
    errorPresenter: presenter,
    getLanguage: () => 'zh-CN',
    getToken: () => 'secret-token',
    onUnauthorized: vi.fn(),
    repeatSubmissions: {
      get: () => repeatSubmission,
      set: value => {
        repeatSubmission = value;
      }
    },
    resolveErrorCode: code => ({ '401': 'unauthorized', default: 'default-error' })[String(code)],
    serializeParams: () => '',
    successCode: 200,
    ...overrides
  };
}

function requestThrough(options: AxiosBrowserOptions, config: Record<string, unknown>) {
  const client = createAxiosBrowserAdapter(options) as unknown as AxiosChainClient;
  return client.request(config);
}

describe('axios production interceptor chain', () => {
  it('preserves request encryption errors without network reclassification or presentation', async () => {
    const crypto: CryptoPort = {
      decryptResponse: vi.fn(),
      encryptRequest: vi.fn(() => {
        throw new Error('key wrapping failed');
      })
    };
    const errorPresenter = { confirmSessionExpired: vi.fn(), present: vi.fn() };

    await expect(
      requestThrough(chainOptions({ crypto, encryptionEnabled: true, errorPresenter }), {
        adapter: vi.fn(),
        data: { password: 'secret' },
        headers: { isEncrypt: true, repeatSubmit: false },
        method: 'post',
        url: '/auth/login'
      })
    ).rejects.toMatchObject({
      kind: 'encryption',
      message: 'Unable to encrypt request',
      cause: { message: 'key wrapping failed', name: 'Error' },
      isHandled: false
    });
    expect(errorPresenter.present).not.toHaveBeenCalled();
  });

  it('does not expose authorization headers through a network error cause', async () => {
    const error = await requestThrough(chainOptions(), {
      adapter: (config: Record<string, unknown>) =>
        Promise.reject(new AxiosErrorConstructor('Network Error', 'ERR_NETWORK', config)),
      method: 'get',
      url: '/private'
    }).catch(value => value);

    expect(error).toMatchObject({
      kind: 'network',
      code: 'ERR_NETWORK',
      cause: { code: 'ERR_NETWORK', message: 'Network Error', name: 'AxiosError' }
    });
    const cause = (error as { cause?: unknown }).cause;
    expect(JSON.stringify(error)).not.toContain('secret-token');
    expect(cause).not.toHaveProperty('config');
    expect(JSON.stringify(cause)).not.toContain('Authorization');
  });

  it('reports an asynchronously rejected unauthorized recovery as unhandled', async () => {
    const onUnauthorized = vi.fn(() => Promise.reject(new Error('logout failed')));
    const error = await requestThrough(chainOptions({ onUnauthorized }), {
      adapter: (config: Record<string, unknown>) =>
        Promise.resolve({ config, data: { code: 401 }, headers: {}, status: 200, statusText: 'OK' }),
      method: 'get',
      url: '/private'
    }).catch(value => value);

    expect(error).toMatchObject({ kind: 'unauthorized', code: 401, isHandled: false });
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });
});
