import { describe, expect, it, vi } from 'vitest';
import { downloadNotificationAttachment } from './actions';

describe('operations navigation effects', () => {
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
    const runtime = {
      service: {
        notifications: {
          attachmentUrl: vi.fn().mockResolvedValue({ data: { url: 'javascript:alert(1)', fileName: 'x' } })
        },
        attachmentIntent: vi.fn(() => {
          throw new Error('unsafe');
        })
      },
      hasPermission: vi.fn(() => true),
      openDownload
    } as never;
    await expect(downloadNotificationAttachment(runtime, 1, 2)).rejects.toThrow('unsafe');
    expect(openDownload).not.toHaveBeenCalled();
  });
});
