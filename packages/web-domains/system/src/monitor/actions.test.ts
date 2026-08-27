import { MonitorSecurityError } from '@namewta/domain-system/monitor';
import { describe, expect, it, vi } from 'vitest';
import { downloadNotificationAttachment } from './actions';

describe('monitor navigation effects', () => {
  it('does not invoke the download port when the authorization API fails', async () => {
    const openDownload = vi.fn();
    const runtime = {
      service: { notifications: { attachmentUrl: vi.fn().mockRejectedValue(new Error('API failed')) } },
      openDownload
    } as never;
    await expect(downloadNotificationAttachment(runtime, 1, 2)).rejects.toThrow('API failed');
    expect(openDownload).not.toHaveBeenCalled();
  });

  it('does not invoke the port when the returned URL is rejected', async () => {
    const openDownload = vi.fn();
    const error = vi.fn();
    const runtime = {
      service: {
        notifications: {
          attachmentUrl: vi.fn().mockResolvedValue({ data: { url: 'javascript:alert(1)', fileName: 'x' } })
        },
        attachmentIntent: vi.fn(() => {
          throw new MonitorSecurityError('unsafe-url', '运维入口地址不安全');
        })
      },
      hasPermission: vi.fn(() => true),
      error,
      openDownload
    } as never;
    await expect(downloadNotificationAttachment(runtime, 1, 2)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith('运维入口地址不安全');
    expect(openDownload).not.toHaveBeenCalled();
  });
});
