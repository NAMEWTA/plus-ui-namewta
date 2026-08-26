import type { WebDomainManifest } from '@namewta/platform-app-runtime';
import { defineComponent, h, type Component } from 'vue';
import type { SystemAdminWebRuntime } from './runtime';

export { createLiveSystemDictRefs, type SystemAdminWebRuntime, type SystemDictOption } from './runtime';

async function runtimeView(
  name: string,
  runtime: SystemAdminWebRuntime,
  load: () => Promise<{ default: Component }>
): Promise<Component> {
  const page = (await load()).default;
  return defineComponent({ name, setup: () => () => h(page, { runtime }) });
}

export function createSystemAdminWebDomain(runtime: SystemAdminWebRuntime): WebDomainManifest<Component> {
  const registrations = [
    ['system-client', 'system/client/index', 'Client', () => import('./views/ClientPage.vue')],
    ['system-user', 'system/user/index', 'User', () => import('./views/UserPage.vue')],
    ['system-user-auth-role', 'system/user/authRole', 'AuthRole', () => import('./views/UserAuthRolePage.vue')],
    ['system-user-type', 'system/userType/index', 'UserType', () => import('./views/UserTypePage.vue')],
    ['system-role', 'system/role/index', 'Role', () => import('./views/RolePage.vue')],
    ['system-role-auth-user', 'system/role/authUser', 'AuthUser', () => import('./views/RoleAuthUserPage.vue')],
    ['system-menu', 'system/menu/index', 'Menu', () => import('./views/MenuPage.vue')],
    ['system-dept', 'system/dept/index', 'Dept', () => import('./views/DepartmentPage.vue')],
    ['system-post', 'system/post/index', 'Post', () => import('./views/PostPage.vue')]
  ] as const;
  return Object.freeze({
    id: 'web-domain-system-admin',
    domainId: 'system-admin',
    messages: Object.freeze([
      Object.freeze({
        namespace: 'systemAdmin',
        messages: Object.freeze({ title: '系统管理', client: '客户端', organization: '组织机构' })
      })
    ]),
    permissions: Object.freeze(
      ['client', 'user', 'userType', 'role', 'menu', 'dept', 'post'].map(slice =>
        Object.freeze({
          id: `system-${slice}`,
          permissions: Object.freeze(
            ['list', 'query', 'add', 'edit', 'remove', 'export'].map(action => `system:${slice}:${action}`)
          )
        })
      )
    ),
    registrations: Object.freeze(
      registrations.map(([id, componentKey, componentName, load]) =>
        Object.freeze({ id, componentKey, componentName, load: () => runtimeView(componentName, runtime, load) })
      )
    )
  });
}
