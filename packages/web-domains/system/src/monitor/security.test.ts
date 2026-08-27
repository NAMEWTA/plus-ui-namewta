import { describe, expect, it } from 'vitest';
import detail from './notify/NotificationDetailDrawer.vue?raw';
import page from './notify/NotificationPage.vue?raw';

describe('notification monitor security contract', () => {
  it('renders stored notification content as text and delegates downloads through the safe port', () => {
    expect(detail).toContain('contentSnapshot');
    expect(detail).toContain('downloadNotificationAttachment');
    expect(detail).not.toMatch(/v-html|innerHTML|document\.createElement/);
  });

  it('retains query and removal permission gates and partial failure state', () => {
    expect(page).toContain('system:notify:query');
    expect(page).toContain('system:notify:remove');
    expect(page).toContain('PARTIAL_FAILURE');
    expect(page).not.toContain('PARTIAL_FAILED');
  });
});
