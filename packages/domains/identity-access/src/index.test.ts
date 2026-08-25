import type { HttpClient, HttpRequest, SessionStore } from '@namewta/platform-contracts';
import { describe, expect, it, vi } from 'vitest';
import {
  createClientSessionKey,
  createIdentityAccessService,
  identityAccessDomainModule,
  IdentityAccessError
} from './index';

const createHarness = (responses: Readonly<Record<string, unknown>>) => {
  const requests: HttpRequest[] = [];
  const http: HttpClient = {
    async request<T>(request: HttpRequest): Promise<T> {
      requests.push(request);
      return responses[request.url] as T;
    }
  };
  const session: SessionStore = {
    clear: vi.fn(),
    getToken: vi.fn(() => null),
    setToken: vi.fn()
  };
  return { http, requests, session };
};

describe('identity access domain', () => {
  it('publishes frozen headless metadata', () => {
    expect(identityAccessDomainModule).toEqual({
      id: 'identity-access',
      backendModules: ['ruoyi-admin', 'ruoyi-system'],
      capabilities: ['client-context', 'password-login', 'isolated-session']
    });
    expect(Object.isFrozen(identityAccessDomainModule)).toBe(true);
    expect(Object.isFrozen(identityAccessDomainModule.backendModules)).toBe(true);
  });

  it('rejects an invalid injected ClientContext before any auth request', async () => {
    const harness = createHarness({});

    expect(() =>
      createIdentityAccessService({ client: { clientId: '   ' }, http: harness.http, session: harness.session })
    ).toThrow('ClientContext.clientId is required');
    expect(harness.requests).toEqual([]);
  });

  it('loads strict client context before requesting a verification code', async () => {
    const harness = createHarness({
      '/auth/client/context': { code: 200, data: { clientEnabled: true, registerEnabled: false } },
      '/auth/code': { code: 200, data: { captchaEnabled: false } }
    });
    const service = createIdentityAccessService({
      client: { clientId: ' client-proof ' },
      http: harness.http,
      session: harness.session
    });

    await expect(service.prepareLogin()).resolves.toEqual({
      context: { clientEnabled: true, registerEnabled: false },
      verification: { captchaEnabled: false }
    });
    expect(harness.requests).toEqual([
      { url: '/auth/client/context', method: 'get', headers: { isToken: false } },
      { url: '/auth/code', method: 'get', headers: { isToken: false }, timeout: 20000 }
    ]);
  });

  it('accepts a complete enabled captcha response and preserves its challenge', async () => {
    const harness = createHarness({
      '/auth/client/context': { code: 200, data: { clientEnabled: true, registerEnabled: false } },
      '/auth/code': { code: 200, data: { captchaEnabled: true, img: ' captcha-image ', uuid: ' captcha-uuid ' } }
    });
    const service = createIdentityAccessService({
      client: { clientId: 'client-proof' },
      http: harness.http,
      session: harness.session
    });

    await expect(service.prepareLogin()).resolves.toMatchObject({
      verification: { captchaEnabled: true, img: 'captcha-image', uuid: 'captcha-uuid' }
    });
  });

  it.each([
    { captchaEnabled: true },
    { captchaEnabled: true, img: '', uuid: 'captcha-uuid' },
    { captchaEnabled: true, img: 'captcha-image', uuid: '   ' },
    { captchaEnabled: true, img: 42, uuid: 'captcha-uuid' }
  ])('fails closed when an enabled captcha challenge is malformed: %j', async verification => {
    const harness = createHarness({
      '/auth/client/context': { code: 200, data: { clientEnabled: true, registerEnabled: false } },
      '/auth/code': { code: 200, data: verification }
    });
    const service = createIdentityAccessService({
      client: { clientId: 'client-proof' },
      http: harness.http,
      session: harness.session
    });

    await expect(service.prepareLogin()).rejects.toMatchObject({ code: 'invalid-verification-response' });
    await expect(service.login({ username: 'user', password: 'secret' })).rejects.toMatchObject({
      code: 'client-context-unavailable'
    });
    expect(harness.requests.map(request => request.url)).toEqual(['/auth/client/context', '/auth/code']);
  });

  it.each([
    { clientEnabled: 'true', registerEnabled: true },
    { clientEnabled: true },
    { clientEnabled: false, registerEnabled: true }
  ])('fails closed before code/login when client context is invalid: %j', async data => {
    const harness = createHarness({ '/auth/client/context': { code: 200, data } });
    const service = createIdentityAccessService({
      client: { clientId: 'client-proof' },
      http: harness.http,
      session: harness.session
    });

    await expect(service.prepareLogin()).rejects.toBeInstanceOf(IdentityAccessError);
    expect(harness.requests.map(request => request.url)).toEqual(['/auth/client/context']);
    await expect(service.login({ username: 'user', password: 'secret' })).rejects.toMatchObject({
      code: 'client-context-unavailable'
    });
    expect(harness.requests.map(request => request.url)).toEqual(['/auth/client/context']);
  });

  it('uses the validated clientId in login payload and writes only the injected session', async () => {
    const harness = createHarness({
      '/auth/client/context': { code: 200, data: { clientEnabled: true, registerEnabled: true } },
      '/auth/code': { code: 200, data: { captchaEnabled: false } },
      '/auth/login': { code: 200, data: { access_token: 'client-token' } }
    });
    const service = createIdentityAccessService({
      client: { clientId: ' client-proof ' },
      encryptLoginRequest: false,
      http: harness.http,
      session: harness.session
    });

    await service.prepareLogin();
    await expect(service.login({ username: 'user', password: 'secret' })).resolves.toEqual({
      accessToken: 'client-token'
    });
    expect(harness.requests.at(-1)).toEqual({
      url: '/auth/login',
      method: 'post',
      headers: { isToken: false, isEncrypt: false, repeatSubmit: false },
      data: { username: 'user', password: 'secret', clientId: 'client-proof', grantType: 'password' }
    });
    expect(harness.session.setToken).toHaveBeenCalledWith('client-token');
  });

  it('creates an explicit per-App and per-client token namespace', () => {
    expect(createClientSessionKey('client-web', ' client-proof ')).toBe('namewta:client-web:client-proof:access-token');
    expect(createClientSessionKey('client-web', 'client/with space')).toBe(
      'namewta:client-web:client%2Fwith%20space:access-token'
    );
    expect(() => createClientSessionKey('', 'client-proof')).toThrow('App id is required');
    expect(createClientSessionKey('client-web', 'client-proof')).not.toBe('Admin-Token');
  });
});
