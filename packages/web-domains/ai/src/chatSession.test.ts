import { describe, expect, it, vi } from 'vitest';
import { createAiChatSession, type AiChatSnapshot } from './chatSession';
import type { AiWebRuntime } from './runtime';

const runtime = (overrides: Partial<AiWebRuntime> = {}): AiWebRuntime => ({
  baseUrl: () => '/prod-api',
  service: {
    registerCurrentSnailUser: vi.fn(async () => ({ code: 200, data: { openId: 'open-user' } }))
  },
  trustedCredential: vi.fn(() => 'private-session-value'),
  ...overrides
});

describe('AI embedded chat lifecycle', () => {
  it('fails closed before registration when the host base URL is missing', async () => {
    const snapshots: AiChatSnapshot[] = [];
    const register = vi.fn();
    const session = createAiChatSession(
      runtime({ baseUrl: () => undefined, service: { registerCurrentSnailUser: register } }),
      snapshot => snapshots.push(snapshot)
    );

    await session.load();

    expect(register).not.toHaveBeenCalled();
    expect(snapshots.at(-1)).toEqual({
      error: 'AI 服务地址不存在，请联系管理员',
      frameUrl: '',
      loading: false
    });
  });

  it('fails closed before registration when the trusted credential is missing', async () => {
    const snapshots: AiChatSnapshot[] = [];
    const register = vi.fn();
    const session = createAiChatSession(
      runtime({ service: { registerCurrentSnailUser: register }, trustedCredential: () => null }),
      snapshot => snapshots.push(snapshot)
    );

    await session.load();

    expect(register).not.toHaveBeenCalled();
    expect(snapshots.at(-1)).toEqual({
      error: '登录凭证不存在，请重新登录后再试',
      frameUrl: '',
      loading: false
    });
  });

  it('keeps loading until the iframe loads and clears the URL when disposed', async () => {
    const snapshots: AiChatSnapshot[] = [];
    const session = createAiChatSession(runtime(), snapshot => snapshots.push(snapshot));

    await session.load();
    const pending = snapshots.at(-1)!;
    expect(pending.loading).toBe(true);
    expect(pending.error).toBe('');
    const url = new URL(pending.frameUrl, 'https://admin.example.test');
    expect(url.pathname).toBe('/prod-api/snail-chat/');
    expect(url.searchParams.get('openId')).toBe('open-user');
    expect(url.searchParams.has('trustedCredential')).toBe(true);

    session.frameLoaded();
    expect(snapshots.at(-1)?.loading).toBe(false);

    session.dispose();
    expect(session.snapshot().frameUrl).toBe('');
  });

  it('clears a credential-bearing URL after frame failure and succeeds on retry', async () => {
    const snapshots: AiChatSnapshot[] = [];
    const register = vi
      .fn()
      .mockRejectedValueOnce(new Error('transport rejected with sensitive context'))
      .mockResolvedValue({ code: 200, data: { openId: 'retry-user' } });
    const session = createAiChatSession(
      runtime({ service: { registerCurrentSnailUser: register } }),
      snapshot => snapshots.push(snapshot)
    );

    await session.load();
    expect(snapshots.at(-1)).toEqual({
      error: '加载 AI 聊天失败，请稍后重试',
      frameUrl: '',
      loading: false
    });

    await session.load();
    expect(snapshots.at(-1)?.frameUrl).not.toBe('');
    session.frameFailed();
    expect(snapshots.at(-1)).toEqual({
      error: 'AI 聊天连接中断，请重新加载',
      frameUrl: '',
      loading: false
    });
    expect(register).toHaveBeenCalledTimes(2);
  });

  it('does not let a stale registration overwrite a newer retry', async () => {
    let resolveFirst!: (value: { code: number; data: { openId: string } }) => void;
    const register = vi
      .fn()
      .mockImplementationOnce(() => new Promise(resolve => (resolveFirst = resolve)))
      .mockResolvedValueOnce({ code: 200, data: { openId: 'current-user' } });
    const session = createAiChatSession(runtime({ service: { registerCurrentSnailUser: register } }), vi.fn());

    const first = session.load();
    await session.load();
    resolveFirst({ code: 200, data: { openId: 'stale-user' } });
    await first;

    const url = new URL(session.snapshot().frameUrl, 'https://admin.example.test');
    expect(url.searchParams.get('openId')).toBe('current-user');
  });
});
