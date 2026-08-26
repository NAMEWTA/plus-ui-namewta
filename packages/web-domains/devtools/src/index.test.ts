import { describe, expect, it } from 'vitest';
import { createDevtoolsWebDomain } from './index';

describe('devtools web domain', () => {
  it('registers only stable generator component keys and permissions', () => {
    const manifest = createDevtoolsWebDomain({} as never);
    expect(manifest).toMatchObject({ id: 'web-domain-devtools', domainId: 'devtools' });
    expect(manifest.registrations.map(item => [item.componentKey, item.componentName])).toEqual([
      ['tool/gen/index', 'Gen'],
      ['tool/gen-edit/index', 'GenEdit']
    ]);
    expect(manifest.permissions.flatMap(item => item.permissions)).toContain('tool:gen:preview');
  });
});
