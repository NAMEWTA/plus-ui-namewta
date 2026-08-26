import { describe, expect, it, vi } from 'vitest';
import { createOperationsService, OperationsSecurityError } from './index';

describe('operations transport and security contracts', () => {
  it('preserves endpoint methods and encodes every path segment', async () => {
    const request = vi.fn().mockResolvedValue({ data: {} });
    const service = createOperationsService({ request });
    await service.loginInfo.delete(['a/b', 2]);
    await service.notifications.attachmentUrl('n/1', 'o?2');
    await service.online.removeCurrent('token/value');
    expect(request.mock.calls.map(([value]) => value)).toEqual([
      { url: '/monitor/loginInfo/a%2Fb,2', method: 'delete' },
      { url: '/monitor/notify/n%2F1/attachments/o%3F2/download-url', method: 'get' },
      { url: '/monitor/online/myself/token%2Fvalue', method: 'delete' }
    ]);
  });

  it('binds the complete monitor surface to its legacy HTTP methods', async () => {
    const request = vi.fn().mockResolvedValue({ data: { rows: [], total: 0 } });
    const service = createOperationsService({ request });
    const page = { pageNum: 1, pageSize: 10 } as never;
    await service.cache.get();
    await service.loginInfo.list(page);
    await service.loginInfo.unlock('user');
    await service.loginInfo.clean();
    await service.notifications.list(page);
    await service.notifications.get(1);
    await service.notifications.delete(1);
    await service.notifications.clean();
    await service.online.list(page);
    await service.online.forceLogout('token');
    await service.online.current();
    await service.operationLogs.list(page);
    await service.operationLogs.delete(1);
    await service.operationLogs.clean();
    expect(request.mock.calls.map(([value]) => `${value.method.toUpperCase()} ${value.url}`)).toEqual([
      'GET /monitor/cache',
      'GET /monitor/loginInfo/list',
      'GET /monitor/loginInfo/unlock/user',
      'DELETE /monitor/loginInfo/clean',
      'GET /monitor/notify/list',
      'GET /monitor/notify/1',
      'DELETE /monitor/notify/1',
      'DELETE /monitor/notify/clean',
      'GET /monitor/online/list',
      'DELETE /monitor/online/token',
      'GET /monitor/online',
      'GET /monitor/operlog/list',
      'DELETE /monitor/operlog/1',
      'DELETE /monitor/operlog/clean'
    ]);
  });

  it.each(['javascript:alert(1)', 'data:text/html,x', '//evil.example/x', 'https://user@evil.example/x', '/ok\\bad'])(
    'rejects unsafe URL %s',
    value => {
      const service = createOperationsService({ request: vi.fn() });
      expect(() => service.externalIntent('monitor-admin', value, true)).toThrow(OperationsSecurityError);
    }
  );

  it('fails closed before exposing a URL when permission is absent', () => {
    const service = createOperationsService({ request: vi.fn() });
    expect(() => service.externalIntent('snail-job', 'https://jobs.example.test', false)).toThrowError(/无权/);
    expect(service.externalIntent('snail-job', '/snail-job', true)).toEqual({
      target: 'snail-job',
      url: '/snail-job',
      mode: 'embed'
    });
  });
});
