import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminAiWebRuntime, resolveAdminWebRegistration } from './adminManifestRegistry';

vi.mock('@/api/login', () => ({ identityAccessService: {} }));
vi.mock('@/views/demo/runtime', () => ({ demoWebRuntime: {} }));

afterEach(() => vi.unstubAllGlobals());

describe('admin selected manifest registry', () => {
  it('selects the active admin manifests and excludes unregistered system slices', () => {
    expect(resolveAdminWebRegistration('identity-access/login/index', 'identity-access')).toMatchObject({
      componentName: 'IdentityLogin'
    });
    expect(resolveAdminWebRegistration('demo/demo/index', 'demo')).toMatchObject({ componentName: 'Demo' });
    expect(resolveAdminWebRegistration('workflow/category/index', 'workflow')).toMatchObject({
      componentName: 'Category'
    });
    expect(resolveAdminWebRegistration('workflow/processDefinition/index', 'workflow')).toMatchObject({
      componentName: 'processDefinition'
    });
    expect(resolveAdminWebRegistration('workflow/task/index', 'workflow')).toBeUndefined();
    expect(resolveAdminWebRegistration('system/user/index', 'system-admin')).toMatchObject({
      componentName: 'User'
    });
    expect(resolveAdminWebRegistration('system/role/authUser', 'system-admin')).toMatchObject({
      componentName: 'AuthUser'
    });
    expect(resolveAdminWebRegistration('system/oss/index', 'system-admin')).toMatchObject({ componentName: 'Oss' });
    expect(resolveAdminWebRegistration('system/dict/index', 'system-admin')).toMatchObject({ componentName: 'Dict' });
    expect(resolveAdminWebRegistration('system/devtools/index', 'system-admin')).toBeUndefined();
    expect(resolveAdminWebRegistration('ai/chat/index', 'ai')).toMatchObject({
      componentName: 'AiChatPage'
    });
    expect(resolveAdminWebRegistration('ai/model/index', 'ai')).toBeUndefined();
  });

  it('probes the same-origin chat document with an abortable HTML request', async () => {
    const fetch = vi.fn(async () =>
      Promise.resolve(new Response('<!doctype html>', { headers: { 'content-type': 'text/html; charset=utf-8' } }))
    );
    vi.stubGlobal('fetch', fetch);
    const controller = new AbortController();

    await expect(
      adminAiWebRuntime.probeFrame({
        signal: controller.signal,
        url: '/prod-api/snail-chat/?openId=user&trustedCredential=redacted'
      })
    ).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith('/prod-api/snail-chat/?openId=user&trustedCredential=redacted', {
      credentials: 'same-origin',
      method: 'GET',
      redirect: 'error',
      signal: controller.signal
    });
  });

  it.each([
    new Response('down', { status: 503, headers: { 'content-type': 'text/html' } }),
    new Response('{}', { headers: { 'content-type': 'application/json' } })
  ])('fails closed when the chat probe is not a successful HTML document', async response => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response)
    );

    await expect(
      adminAiWebRuntime.probeFrame({ signal: new AbortController().signal, url: '/prod-api/snail-chat/' })
    ).rejects.toThrow('AI chat probe failed');
  });

  it.each([
    { bodyUsed: false, locked: false, outcome: 'success' as const, shouldCancel: true },
    { bodyUsed: false, locked: false, outcome: 'failure' as const, shouldCancel: true },
    { bodyUsed: false, locked: true, outcome: 'success' as const, shouldCancel: false },
    { bodyUsed: true, locked: false, outcome: 'success' as const, shouldCancel: false }
  ])('releases only unread and unlocked probe bodies: $outcome/$bodyUsed/$locked', async entry => {
    const cancel = vi.fn(async () => undefined);
    const response = {
      body: { cancel, locked: entry.locked },
      bodyUsed: entry.bodyUsed,
      headers: new Headers({ 'content-type': 'text/html' }),
      ok: entry.outcome === 'success'
    } as unknown as Response;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response)
    );

    const result = adminAiWebRuntime.probeFrame({
      signal: new AbortController().signal,
      url: '/prod-api/snail-chat/'
    });
    if (entry.outcome === 'success') await expect(result).resolves.toBeUndefined();
    else await expect(result).rejects.toThrow('AI chat probe failed');
    expect(cancel).toHaveBeenCalledTimes(entry.shouldCancel ? 1 : 0);
  });

  it('accepts a successful probe without a response body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          ({
            body: null,
            bodyUsed: false,
            headers: new Headers({ 'content-type': 'text/html' }),
            ok: true
          }) as Response
      )
    );

    await expect(
      adminAiWebRuntime.probeFrame({ signal: new AbortController().signal, url: '/prod-api/snail-chat/' })
    ).resolves.toBeUndefined();
  });
});
