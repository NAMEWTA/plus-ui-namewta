import { describe, expect, it, vi } from 'vitest';
import { createOperationsWebDomain } from './index';

const runtime = {
  service: {} as never,
  iframe: {} as never,
  externalUrls: { 'monitor-admin': '/admin', 'snail-job': '/job', 'snail-ai': '/ai' },
  confirm: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  loading: vi.fn(),
  closeLoading: vi.fn(),
  download: vi.fn(),
  openDownload: vi.fn(),
  dicts: vi.fn(() => ({})),
  hasPermission: vi.fn(() => true)
};

describe('operations web manifest', () => {
  it('registers the exact legacy component keys and complete permission inventory', () => {
    const manifest = createOperationsWebDomain(runtime);
    expect(manifest.registrations.map(item => item.componentKey)).toEqual([
      'monitor/online/index',
      'monitor/cache/index',
      'monitor/admin/index',
      'monitor/snailjob/index',
      'monitor/snailai/index',
      'monitor/operlog/index',
      'monitor/logininfo/index',
      'monitor/notify/index'
    ]);
    expect(manifest.permissions.flatMap(item => item.permissions)).toEqual(
      expect.arrayContaining([
        'monitor:online:forceLogout',
        'monitor:online:batchLogout',
        'monitor:operlog:export',
        'monitor:logininfo:unlock',
        'system:notify:list',
        'system:notify:query',
        'system:notify:remove'
      ])
    );
  });
});
