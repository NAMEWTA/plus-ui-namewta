import { describe, expect, it } from 'vitest';
import { createGenWebDomain } from './index';

describe('gen web domain', () => {
  it('registers only stable generator component keys and permissions', () => {
    const manifest = createGenWebDomain({} as never);
    expect(manifest).toMatchObject({ id: 'web-domain-gen', domainId: 'gen' });
    expect(manifest.registrations.map(item => [item.componentKey, item.componentName])).toEqual([
      ['tool/gen/index', 'Gen'],
      ['tool/gen-edit/index', 'GenEdit']
    ]);
    expect(manifest.permissions.flatMap(item => item.permissions)).toContain('tool:gen:preview');
  });
});
