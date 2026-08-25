import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosHarness = vi.hoisted(() => {
  const requestUse = vi.fn();
  let responseFulfilled: ((response: unknown) => unknown) | undefined;
  const responseUse = vi.fn((fulfilled: (response: unknown) => unknown) => {
    responseFulfilled = fulfilled;
  });
  const service = Object.assign(vi.fn(), {
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse }
    },
    post: vi.fn()
  });
  const axios = {
    defaults: { headers: {} as Record<string, string> },
    create: vi.fn(() => service)
  };
  return { axios, getResponseFulfilled: () => responseFulfilled, requestUse, responseUse, service };
});

const runtime = vi.hoisted(() => ({
  confirm: vi.fn(),
  logout: vi.fn(),
  replace: vi.fn(),
  currentRoute: { value: { fullPath: '/system/user?tab=roles' } },
  message: Object.assign(vi.fn(), { error: vi.fn() }),
  notificationError: vi.fn(),
  loadingService: vi.fn()
}));

vi.mock('axios', () => ({ default: axiosHarness.axios }));
vi.mock('element-plus/es', () => ({
  ElLoading: { service: runtime.loadingService },
  ElMessage: runtime.message,
  ElMessageBox: { confirm: runtime.confirm },
  ElNotification: { error: runtime.notificationError }
}));
vi.mock('@/lang', () => ({ getLanguage: vi.fn(() => 'zh-CN') }));
vi.mock('@/plugins/cache', () => ({
  default: {
    session: {
      getJSON: vi.fn(),
      setJSON: vi.fn()
    }
  }
}));
vi.mock('@/router', () => ({
  default: {
    currentRoute: runtime.currentRoute,
    replace: runtime.replace
  }
}));
vi.mock('@/store/modules/user', () => ({ useUserStore: vi.fn(() => ({ logout: runtime.logout })) }));
vi.mock('@/utils/auth', () => ({ getToken: vi.fn(() => 'baseline-token') }));
vi.mock('@/utils/crypto', () => ({
  decryptBase64: vi.fn(),
  decryptWithAes: vi.fn(),
  encryptBase64: vi.fn(),
  encryptWithAes: vi.fn(),
  generateAesKey: vi.fn()
}));
vi.mock('@/utils/jsencrypt', () => ({ decrypt: vi.fn(), encrypt: vi.fn() }));
vi.mock('@/utils/ruoyi', () => ({
  blobValidate: vi.fn(),
  tansParams: vi.fn(() => '')
}));
vi.mock('@/utils/save', () => ({ saveBlob: vi.fn() }));

import { isRelogin } from './request';

type ResponseFulfilled = (response: unknown) => unknown;

const unauthorizedResponse = () => ({
  data: { code: 401, msg: 'expired' },
  headers: {},
  request: { responseType: 'json' }
});

const getResponseFulfilled = () => {
  const fulfilled = axiosHarness.getResponseFulfilled();
  expect(fulfilled).toBeDefined();
  return fulfilled as ResponseFulfilled;
};

describe('request 401 baseline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isRelogin.show = false;
    runtime.logout.mockResolvedValue(undefined);
  });

  it('shows one relogin prompt while concurrent 401 responses are pending', async () => {
    let rejectPrompt: (reason: Error) => void = () => undefined;
    runtime.confirm.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectPrompt = reject;
      })
    );
    const responseFulfilled = getResponseFulfilled();

    await expect(responseFulfilled(unauthorizedResponse())).rejects.toBe('无效的会话，或者会话已过期，请重新登录。');
    await expect(responseFulfilled(unauthorizedResponse())).rejects.toBe('无效的会话，或者会话已过期，请重新登录。');

    expect(runtime.confirm).toHaveBeenCalledOnce();
    expect(isRelogin.show).toBe(true);

    rejectPrompt(new Error('cancelled'));
    await vi.waitFor(() => expect(isRelogin.show).toBe(false));
    expect(runtime.logout).not.toHaveBeenCalled();
    expect(runtime.replace).not.toHaveBeenCalled();
  });

  it('logs out and redirects to login with the encoded current location after confirmation', async () => {
    runtime.confirm.mockResolvedValue(undefined);
    const responseFulfilled = getResponseFulfilled();

    await expect(responseFulfilled(unauthorizedResponse())).rejects.toBe('无效的会话，或者会话已过期，请重新登录。');
    await vi.waitFor(() => expect(runtime.logout).toHaveBeenCalledOnce());
    await vi.waitFor(() =>
      expect(runtime.replace).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '%2Fsystem%2Fuser%3Ftab%3Droles' }
      })
    );
    expect(isRelogin.show).toBe(false);
  });
});
