import { describe, expect, it, vi } from 'vitest';
import { resolveAdminWebRegistration } from './adminManifestRegistry';

vi.mock('@/api/login', () => ({ identityAccessService: {} }));
vi.mock('@/views/demo/runtime', () => ({ demoWebRuntime: {} }));

describe('admin selected manifest registry', () => {
  it('selects the active admin manifests and excludes unregistered system slices', () => {
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
    expect(resolveAdminWebRegistration('system/user/index', 'system-admin')).toMatchObject({
      componentName: 'User'
    });
    expect(resolveAdminWebRegistration('system/role/authUser', 'system-admin')).toMatchObject({
      componentName: 'AuthUser'
    });
    expect(resolveAdminWebRegistration('system/oss/index', 'system-admin')).toBeUndefined();
    expect(resolveAdminWebRegistration('ai/chat/index', 'ai')).toMatchObject({
      componentName: 'AiChatPage'
    });
    expect(resolveAdminWebRegistration('ai/model/index', 'ai')).toBeUndefined();
  });
});
