import { describe, expect, it } from 'vitest';
import { createNotifyWebDomain } from './index';

describe('通知 Web Domain', () => {
  it('显式注册监控页面和权限', () => {
    const manifest = createNotifyWebDomain({
      service: {} as never,
      hasPermission: () => true,
      navigate: () => undefined,
      dicts: () => ({}),
      directory: {
        searchUsers: async () => ({ data: { rows: [], total: 0 } }),
        usersByIds: async () => ({ data: [] }),
        userTypes: async () => ({ data: [] })
      }
    });
    expect(manifest.id).toBe('web-domain-notify');
    expect(manifest.registrations.map(item => item.componentKey)).toEqual([
      'notify/monitor/index',
      'notify/notice/index',
      'notify/inbox/index',
      'notify/config/index'
    ]);
    expect(manifest.permissions[0]?.permissions).toContain('notify:monitor:list');
    expect(manifest.permissions.map(item => item.id)).toContain('notify-config');
  });
});
