import { requestRelogin } from '@namewta/platform-auth';
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { LoginResult } from '@/api/types';
import type { RuoYiAjaxResult } from '@/utils/api-types';

vi.hoisted(() => {
  process.env.VITE_APP_CLIENT_ID = 'admin-client';
  process.env.VITE_APP_MESSAGE_ENABLED = 'true';
  process.env.VITE_APP_MESSAGE_TRANSPORT = 'sse';
  process.env.VITE_APP_MESSAGE_PATH = '/resource/message';
});

const requestMock = vi.hoisted(() => vi.fn());
const sessionMock = vi.hoisted(() => ({
  getToken: vi.fn(() => 'admin-token'),
  removeToken: vi.fn(),
  setToken: vi.fn()
}));
const closePush = vi.hoisted(() => vi.fn());

vi.mock('@/utils/request', () => ({ default: requestMock }));
vi.mock('@/utils/auth', () => sessionMock);
vi.mock('@/utils/push', () => ({ closePush }));

import { callback, logout } from '@/api/login';

describe('admin logout recovery facade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('continues one logout, session-clear and redirect chain when message close rejects with 401', async () => {
    requestMock.mockImplementation(({ url }: { url: string }) => {
      if (url === '/resource/message/close') {
        return Promise.reject(Object.assign(new Error('expired message session'), { code: 401 }));
      }
      if (url === '/auth/logout') return Promise.resolve({ code: 200, data: null });
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });
    const state = { show: false };
    const presenter = { confirmSessionExpired: vi.fn(() => Promise.resolve()), present: vi.fn() };
    const navigation = {
      currentLocation: vi.fn(() => '/system/user?tab=roles'),
      replaceWithLogin: vi.fn(() => Promise.resolve())
    };

    const session = {
      logout: async () => {
        await logout();
      }
    };
    requestRelogin({ navigation, presenter, session, state });
    requestRelogin({ navigation, presenter, session, state });

    await vi.waitFor(() => expect(navigation.replaceWithLogin).toHaveBeenCalledOnce());
    expect(requestMock.mock.calls.map(([request]) => request.url)).toEqual(['/resource/message/close', '/auth/logout']);
    expect(sessionMock.removeToken).toHaveBeenCalledOnce();
    expect(navigation.replaceWithLogin).toHaveBeenCalledWith('%2Fsystem%2Fuser%3Ftab%3Droles');
    expect(presenter.confirmSessionExpired).toHaveBeenCalledOnce();
    expect(state.show).toBe(false);
  });
});

describe('social callback facade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes and returns the token-or-null callback result', async () => {
    expectTypeOf(callback).returns.toEqualTypeOf<Promise<RuoYiAjaxResult<LoginResult | null>>>();
    requestMock.mockImplementation(({ url }: { url: string }) => {
      if (url === '/auth/client/context') {
        return Promise.resolve({ code: 200, data: { clientEnabled: true, registerEnabled: false } });
      }
      if (url === '/auth/social/callback') {
        return Promise.resolve({ code: 200, data: { access_token: 'oauth-token' }, msg: '绑定成功' });
      }
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    await expect(
      callback({ clientId: 'admin-client', grantType: 'social', socialCode: 'code', socialState: 'state' })
    ).resolves.toEqual({ code: 200, data: { access_token: 'oauth-token' }, msg: '绑定成功' });
    expect(sessionMock.setToken).toHaveBeenCalledWith('oauth-token');
  });

  it('returns null when a callback succeeds without rotating the token', async () => {
    requestMock.mockImplementation(({ url }: { url: string }) => {
      if (url === '/auth/client/context') {
        return Promise.resolve({ code: 200, data: { clientEnabled: true, registerEnabled: false } });
      }
      if (url === '/auth/social/callback') {
        return Promise.resolve({ code: 200, data: null, msg: '绑定成功' });
      }
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    await expect(
      callback({ clientId: 'admin-client', grantType: 'social', socialCode: 'code', socialState: 'state' })
    ).resolves.toEqual({ code: 200, data: null, msg: '绑定成功' });
    expect(sessionMock.setToken).not.toHaveBeenCalled();
  });
});
