import { describe, expect, it } from 'vitest';
import { createHandledError, isHandledError, normalizeTransportMessage } from './index';

describe('platform http errors', () => {
  it('keeps handled and network error semantics stable', () => {
    expect(isHandledError(createHandledError('failed'))).toBe(true);
    expect(normalizeTransportMessage('Network Error')).toBe('后端接口连接异常');
    expect(normalizeTransportMessage('timeout of 50000ms exceeded')).toBe('系统接口请求超时');
  });
});
