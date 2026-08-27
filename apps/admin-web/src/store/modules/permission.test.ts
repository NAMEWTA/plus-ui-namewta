import type { RouteRecordRaw } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdminAccessEvaluator } from '@/application/access';
import { identityAccessService } from '@/application/services';
import router from '@/router';
import { filterDynamicRoutes, usePermissionStore } from './permission';

vi.mock('@/application/services', () => ({ identityAccessService: { getMenus: vi.fn() } }));
vi.mock('@/router/adminManifestRegistry', () => ({ resolveAdminWebRegistration: vi.fn() }));
vi.mock('@/components/ParentView/index.vue', () => ({ default: { name: 'ParentView' } }));
vi.mock('@/layout/components/InnerLink/index.vue', () => ({ default: { name: 'InnerLink' } }));
vi.mock('@/layout/index.vue', () => ({ default: { name: 'Layout' } }));
vi.mock('@/application/access', () => ({
  createAdminAccessEvaluator: vi.fn(() => ({
    hasAnyPermission: vi.fn(),
    hasAnyRole: vi.fn()
  }))
}));
vi.mock('@/router', () => ({
  constantRoutes: [{ path: '/constant', name: 'Constant' }],
  dynamicRoutes: [
    { path: '/local-permission', name: 'LocalPermission', permissions: ['local:allowed'] },
    { path: '/local-role', name: 'LocalRole', roles: ['role-denied'] },
    { path: '/local-unscoped', name: 'LocalUnscoped' }
  ],
  default: { addRoute: vi.fn() }
}));
vi.mock('@/store', () => ({ default: {} }));
vi.mock('@/utils/createCustomNameComponent', () => ({
  createCustomNameComponent: vi.fn((_loader, options: { name: string }) => ({ name: options.name }))
}));

describe('permission route baseline', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(createAdminAccessEvaluator).mockReturnValue({
      hasAnyPermission: permissions => permissions.includes('local:allowed'),
      hasAnyRole: () => false
    } as never);
  });

  it('maps every server-filtered menu without applying local client permission checks', async () => {
    const serverRoutes: RouteRecordRaw[] = [
      {
        path: '/server-menu',
        name: 'ServerMenu',
        component: 'Layout' as never,
        permissions: ['server:metadata-only'],
        children: [
          {
            path: 'baseline',
            name: 'ServerBaseline',
            component: 'index' as never,
            meta: { title: 'Server filtered baseline' }
          }
        ]
      }
    ];
    vi.mocked(identityAccessService.getMenus).mockResolvedValue(serverRoutes as never);

    const store = usePermissionStore();
    const generated = await store.generateRoutes();

    expect(generated).toHaveLength(1);
    expect(generated[0]).toMatchObject({
      path: '/server-menu',
      name: 'ServerMenu',
      permissions: ['server:metadata-only']
    });
    expect(generated[0]?.component).toMatchObject({ name: 'Layout' });
    expect(generated[0]?.children?.[0]).toMatchObject({
      path: 'baseline',
      name: 'ServerBaseline',
      component: { name: 'ServerBaseline' }
    });
    expect(store.getSidebarRoutes()).toEqual([
      expect.objectContaining({ path: '/constant' }),
      expect.objectContaining({ path: '/server-menu' })
    ]);
    expect(router.addRoute).toHaveBeenCalledOnce();
    expect(router.addRoute).toHaveBeenCalledWith(expect.objectContaining({ path: '/local-permission' }));
  });

  it('keeps local dynamic routes only when their permission or role evaluator allows them', () => {
    vi.mocked(createAdminAccessEvaluator).mockReturnValue({
      hasAnyPermission: permissions => permissions.includes('local:allowed'),
      hasAnyRole: roles => roles.includes('role-allowed')
    } as never);
    const routes: RouteRecordRaw[] = [
      { path: '/permission', component: 'index' as never, permissions: ['local:allowed'] },
      { path: '/role', component: 'index' as never, roles: ['role-allowed'] },
      { path: '/denied', component: 'index' as never, permissions: ['local:denied'] },
      { path: '/unscoped', component: 'index' as never }
    ];

    expect(filterDynamicRoutes(routes).map(route => route.path)).toEqual(['/permission', '/role']);
  });
});
