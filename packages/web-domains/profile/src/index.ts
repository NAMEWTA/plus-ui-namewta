import type { WebDomainManifest } from '@namewta/platform-app-runtime';
import { profilePermissions } from '@namewta/domain-profile';
import { defineComponent, h, type Component } from 'vue';
import type { ProfileWebRuntime } from './runtime';

export {
  requireProfileWebRuntime,
  type ProfileUserOption,
  type ProfileWebRuntime,
  type ProfileWorkflowCommand
} from './runtime';

async function runtimeView(
  name: string,
  runtime: ProfileWebRuntime,
  load: () => Promise<{ default: Component }>
): Promise<Component> {
  const page = (await load()).default;
  return defineComponent({ name, setup: () => () => h(page, { runtime }) });
}

export function createProfileWebDomain(runtime: ProfileWebRuntime): WebDomainManifest<Component> {
  const registrations = [
    [
      'profile-material-tag',
      'profile/materialTag/index',
      'ProfileMaterialTag',
      () => import('./material-tag/MaterialTagPage.vue')
    ],
    ['profile-person', 'profile/person/index', 'PersonProfile', () => import('./person/PersonProfilePage.vue')],
    [
      'profile-person-detail',
      'profile/person/detail',
      'PersonProfileDetail',
      () => import('./person/PersonProfileDetailPage.vue')
    ],
    [
      'profile-person-review',
      'profile/person/review',
      'PersonProfileReview',
      () => import('./person/PersonProfileReviewPage.vue')
    ],
    [
      'profile-enterprise',
      'profile/enterprise/index',
      'EnterpriseProfile',
      () => import('./enterprise/EnterpriseProfilePage.vue')
    ],
    [
      'profile-enterprise-detail',
      'profile/enterprise/detail',
      'EnterpriseProfileDetail',
      () => import('./enterprise/EnterpriseProfileDetailPage.vue')
    ],
    [
      'profile-enterprise-review',
      'profile/enterprise/review',
      'EnterpriseProfileReview',
      () => import('./enterprise/EnterpriseProfileReviewPage.vue')
    ]
  ] as const;
  const permissionGroups = [
    ['profile-material-tag', Object.values(profilePermissions.materialTag)],
    ['profile-person', Object.values(profilePermissions.person)],
    ['profile-enterprise', Object.values(profilePermissions.enterprise)]
  ] as const;
  return Object.freeze({
    id: 'web-domain-profile',
    domainId: 'profile',
    messages: Object.freeze([
      Object.freeze({
        namespace: 'profileAdmin',
        messages: Object.freeze({ title: '档案管理', person: '个人档案', enterprise: '企业档案', material: '材料标签' })
      })
    ]),
    permissions: Object.freeze(
      permissionGroups.map(([id, permissions]) => Object.freeze({ id, permissions: Object.freeze(permissions) }))
    ),
    registrations: Object.freeze(
      registrations.map(([id, componentKey, componentName, load]) =>
        Object.freeze({ id, componentKey, componentName, load: () => runtimeView(componentName, runtime, load) })
      )
    )
  });
}
