import { describe, expect, it } from 'vitest';
import { createTransportError, isHandledError, isTransportError, normalizeTransportMessage } from './index';

describe('platform http errors', () => {
  it('keeps handled and network error semantics stable', () => {
    const cause = new Error('socket closed');
    const error = createTransportError({
      kind: 'network',
      message: 'failed',
      code: 'ECONNRESET',
      cause,
      handled: true
    });
    expect(isHandledError(error)).toBe(true);
    expect(isTransportError(error)).toBe(true);
    expect(error).toMatchObject({ kind: 'network', code: 'ECONNRESET', cause, isHandled: true });
    expect(createTransportError({ kind: 'encryption', message: 'not presented' }).isHandled).toBe(false);
    expect(normalizeTransportMessage('Network Error')).toBe('后端接口连接异常');
    expect(normalizeTransportMessage('timeout of 50000ms exceeded')).toBe('系统接口请求超时');
  });
});
