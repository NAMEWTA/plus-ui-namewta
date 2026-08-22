import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSibling = (fileName: string) => readFileSync(new URL(fileName, import.meta.url), 'utf8');

describe('notification monitor security contract', () => {
  it('never injects stored notification HTML into the application DOM', () => {
    const detail = readSibling('./detailDrawer.vue');

    expect(detail).not.toContain('v-html');
    expect(detail).not.toContain('innerHTML');
    expect(detail).toContain('contentSnapshot');
  });

  it('keeps query and removal controls behind their dynamic permissions', () => {
    const page = readSibling('./index.vue');

    expect(page).toContain('system:notify:query');
    expect(page).toContain('system:notify:remove');
    expect(page).toContain('PARTIAL_FAILURE');
    expect(page).not.toContain('PARTIAL_FAILED');
  });
});
