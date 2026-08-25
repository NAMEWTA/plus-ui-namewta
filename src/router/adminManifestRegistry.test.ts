import { describe, expect, it, vi } from 'vitest';
import { resolveAdminWebRegistration } from './adminManifestRegistry';

vi.mock('@/api/login', () => ({ identityAccessService: {} }));
vi.mock('@/views/demo/runtime', () => ({ demoWebRuntime: {} }));

describe('admin selected manifest registry', () => {
  it('selects identity-access and demo registrations only', () => {
    expect(resolveAdminWebRegistration('identity-access/login/index', 'identity-access')).toMatchObject({
      componentName: 'IdentityLogin'
    });
    expect(resolveAdminWebRegistration('demo/demo/index', 'demo')).toMatchObject({ componentName: 'Demo' });
    expect(resolveAdminWebRegistration('workflow/category/index', 'workflow')).toMatchObject({
      componentName: 'Category'
    });
    expect(resolveAdminWebRegistration('workflow/processDefinition/index', 'workflow')).toMatchObject({
      componentName: 'processDefinition'
    });
    expect(resolveAdminWebRegistration('workflow/task/index', 'workflow')).toBeUndefined();
  });
});
