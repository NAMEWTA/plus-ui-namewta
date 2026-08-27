import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('notification legacy facade security', () => {
  it('delegates rendering without introducing raw HTML sinks', () => {
    const page = readFileSync(new URL('./index.vue', import.meta.url), 'utf8');
    const detail = readFileSync(new URL('./detailDrawer.vue', import.meta.url), 'utf8');
    expect(page).toContain('OperationsNotificationPage');
    expect(detail).toContain('OperationsNotificationDetailDrawer');
    expect(page + detail).not.toMatch(/v-html|innerHTML|document\.createElement/);
  });
});
