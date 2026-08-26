import type { DomainModule } from '@namewta/platform-app-runtime';
import type { HttpClient, HttpRequest } from '@namewta/platform-contracts';
import { createUserQueryPort, type UserQueryPort } from '../public/user/index';

export type { ClientForm, ClientQuery, ClientVO } from './identity/client/types';
export type { DeptTreeOption, RoleDeptTree, RoleForm, RoleQuery, RoleVO } from './identity/role/types';
export type {
  ResetPwdForm,
  UserForm,
  UserInfo,
  UserInfoVO,
  UserProfileForm,
  UserProfileInfoVO,
  UserQuery,
  UserVO
} from './identity/user/types';
export type { UserTypeForm, UserTypeQuery, UserTypeVO } from './identity/user-type/types';
export type {
  MenuForm,
  MenuQuery,
  MenuTreeOption,
  MenuType,
  MenuVO,
  RoleMenuButtonOption,
  RoleMenuTree
} from './menu/types';
export type { DeptForm, DeptQuery, DeptTreeVO, DeptVO } from './organization/department/types';
export type { PostForm, PostQuery, PostVO } from './organization/post/types';

export type Identifier = string | number;
export type IdentifierList = Identifier | readonly Identifier[];
export type Query = object;
export type Payload = object;
export interface ApiResponse<T = any> {
  code?: number;
  data: T;
  msg?: string;
}
export interface PageResult<T = any> {
  rows: T[];
  total: number;
}

const segment = (value: IdentifierList) =>
  (Array.isArray(value) ? value : [value]).map(item => encodeURIComponent(String(item))).join(',');

export interface SystemAdminService {
  readonly publicUsers: UserQueryPort;
  readonly users: {
    list(query: Query): Promise<ApiResponse<PageResult>>;
    options(userIds: readonly Identifier[]): Promise<ApiResponse>;
    add(data: Payload): Promise<ApiResponse>;
    authRoles(userId: Identifier, clientId: Identifier): Promise<ApiResponse>;
    changeStatus(userId: Identifier, status: string): Promise<ApiResponse>;
    delete(ids: IdentifierList): Promise<ApiResponse>;
    departmentTree(): Promise<ApiResponse>;
    get(userId?: Identifier, clientId?: Identifier): Promise<ApiResponse>;
    listByDepartment(deptId: Identifier): Promise<ApiResponse>;
    profile(): Promise<ApiResponse>;
    resetPassword(userId: Identifier, password: string): Promise<ApiResponse>;
    unlock(userId: Identifier): Promise<ApiResponse>;
    update(data: Payload): Promise<ApiResponse>;
    updateAuthRoles(data: Query): Promise<ApiResponse>;
    updatePassword(oldPassword: string, newPassword: string): Promise<ApiResponse>;
    updateProfile(data: Payload): Promise<ApiResponse>;
  };
  readonly clients: CrudService & {
    changeStatus(clientId: string, status: string): Promise<ApiResponse>;
    options(): Promise<any[]>;
  };
  readonly userTypes: CrudService & { options(): Promise<ApiResponse> };
  readonly roles: CrudService & {
    allocatedUsers(query: Query): Promise<ApiResponse>;
    cancelUser(data: Payload): Promise<ApiResponse>;
    cancelUsers(data: Query): Promise<ApiResponse>;
    changeStatus(roleId: Identifier, status: string): Promise<ApiResponse>;
    departmentTree(roleId: Identifier): Promise<ApiResponse>;
    options(roleIds: readonly Identifier[]): Promise<ApiResponse>;
    selectUsers(data: Query): Promise<ApiResponse>;
    unallocatedUsers(query: Query): Promise<ApiResponse>;
    updatePermission(data: Payload): Promise<ApiResponse>;
  };
  readonly menus: {
    add(data: Payload): Promise<ApiResponse>;
    cascadeDelete(ids: readonly Identifier[]): Promise<ApiResponse>;
    delete(id: Identifier): Promise<ApiResponse>;
    get(id: Identifier): Promise<ApiResponse>;
    list(query?: Query): Promise<ApiResponse>;
    roleTree(roleId: Identifier): Promise<ApiResponse>;
    tree(clientId?: Identifier): Promise<ApiResponse>;
    update(data: Payload): Promise<ApiResponse>;
  };
  readonly departments: {
    add(data: Payload): Promise<ApiResponse>;
    delete(id: Identifier): Promise<ApiResponse>;
    excludeChildren(id: Identifier): Promise<ApiResponse>;
    get(id: Identifier): Promise<ApiResponse>;
    list(query?: Query): Promise<ApiResponse>;
    options(ids: readonly Identifier[]): Promise<ApiResponse>;
    update(data: Payload): Promise<ApiResponse>;
  };
  readonly posts: CrudService & {
    departmentTree(): Promise<ApiResponse>;
    options(deptId?: Identifier, postIds?: readonly Identifier[]): Promise<ApiResponse>;
  };
}

interface CrudService {
  add(data: Payload): Promise<ApiResponse>;
  changeStatus?(id: Identifier, status: string): Promise<ApiResponse>;
  delete(ids: IdentifierList): Promise<ApiResponse>;
  get(id: Identifier): Promise<ApiResponse>;
  list(query?: Query): Promise<ApiResponse>;
  update(data: Payload): Promise<ApiResponse>;
}

export const systemAdminDomainModule: DomainModule = Object.freeze({
  id: 'system-admin',
  backendModules: Object.freeze(['ruoyi-system']),
  capabilities: Object.freeze(['client', 'user', 'user-type', 'role', 'menu', 'department', 'post'])
});

export function createSystemAdminService(http: HttpClient): SystemAdminService {
  const request = <T = unknown>(config: HttpRequest) => http.request<ApiResponse<T>>(config);
  const publicUsers = createUserQueryPort(http);
  const clients = Object.freeze({
    list: (params?: Query) => request<PageResult>({ url: '/system/client/list', method: 'get', params }),
    get: (id: Identifier) => request({ url: '/system/client/' + segment(id), method: 'get' }),
    add: (data: Payload) => request({ url: '/system/client', method: 'post', data }),
    update: (data: Payload) => request({ url: '/system/client', method: 'put', data }),
    delete: (ids: IdentifierList) => request({ url: '/system/client/' + segment(ids), method: 'delete' }),
    changeStatus: (clientId: string, status: string) =>
      request({ url: '/system/client/changeStatus', method: 'put', data: { clientId, status } }),
    options: async () => (await clients.list({ pageNum: 1, pageSize: 1000 })).data?.rows ?? []
  });
  const userTypes = Object.freeze({
    list: (params?: Query) => request<PageResult>({ url: '/system/userType/list', method: 'get', params }),
    get: (id: Identifier) => request({ url: '/system/userType/' + segment(id), method: 'get' }),
    options: () => request({ url: '/system/userType/options', method: 'get' }),
    add: (data: Payload) => request({ url: '/system/userType', method: 'post', data }),
    update: (data: Payload) => request({ url: '/system/userType', method: 'put', data }),
    delete: (ids: IdentifierList) => request({ url: '/system/userType/' + segment(ids), method: 'delete' })
  });
  const roles = Object.freeze({
    list: (params?: Query) => request<PageResult>({ url: '/system/role/list', method: 'get', params }),
    options: (ids: readonly Identifier[]) =>
      request({ url: '/system/role/optionselect?roleIds=' + segment(ids), method: 'get' }),
    get: (id: Identifier) => request({ url: '/system/role/' + segment(id), method: 'get' }),
    add: (data: Payload) => request({ url: '/system/role', method: 'post', data }),
    update: (data: Payload) => request({ url: '/system/role', method: 'put', data }),
    updatePermission: (data: Payload) => request({ url: '/system/role/permission', method: 'put', data }),
    changeStatus: (roleId: Identifier, status: string) =>
      request({ url: '/system/role/changeStatus', method: 'put', data: { roleId, status } }),
    delete: (ids: IdentifierList) => request({ url: '/system/role/' + segment(ids), method: 'delete' }),
    allocatedUsers: (params: Query) =>
      request<PageResult>({ url: '/system/role/authUser/allocatedList', method: 'get', params }),
    unallocatedUsers: (params: Query) =>
      request<PageResult>({ url: '/system/role/authUser/unallocatedList', method: 'get', params }),
    cancelUser: (data: Payload) => request({ url: '/system/role/authUser/cancel', method: 'put', data }),
    cancelUsers: (params: Query) => request({ url: '/system/role/authUser/cancelAll', method: 'put', params }),
    selectUsers: (params: Query) => request({ url: '/system/role/authUser/selectAll', method: 'put', params }),
    departmentTree: (id: Identifier) => request({ url: '/system/role/deptTree/' + segment(id), method: 'get' })
  });
  return Object.freeze({
    clients,
    publicUsers,
    userTypes,
    roles,
    users: Object.freeze({
      list: (params: Query) => request<PageResult>({ url: '/system/user/list', method: 'get', params }),
      options: (ids: readonly Identifier[]) =>
        request({ url: '/system/user/optionselect?userIds=' + segment(ids), method: 'get' }),
      get: (id?: Identifier, clientId?: Identifier) =>
        request({
          url: '/system/user/' + (id === undefined ? '' : segment(id)),
          method: 'get',
          params: clientId === undefined ? undefined : { clientId }
        }),
      add: (data: Payload) => request({ url: '/system/user', method: 'post', data }),
      update: (data: Payload) => request({ url: '/system/user', method: 'put', data }),
      delete: (ids: IdentifierList) => request({ url: '/system/user/' + segment(ids), method: 'delete' }),
      resetPassword: (userId: Identifier, password: string) =>
        request({
          url: '/system/user/resetPwd',
          method: 'put',
          headers: { isEncrypt: true, repeatSubmit: false },
          data: { userId, password }
        }),
      changeStatus: (userId: Identifier, status: string) =>
        request({ url: '/system/user/changeStatus', method: 'put', data: { userId, status } }),
      unlock: (id: Identifier) => request({ url: '/system/user/unlock/' + segment(id), method: 'get' }),
      profile: () => request({ url: '/system/user/profile', method: 'get' }),
      updateProfile: (data: Payload) => request({ url: '/system/user/profile', method: 'put', data }),
      updatePassword: (oldPassword: string, newPassword: string) =>
        request({
          url: '/system/user/profile/updatePwd',
          method: 'put',
          headers: { isEncrypt: true, repeatSubmit: false },
          data: { oldPassword, newPassword }
        }),
      authRoles: (id: Identifier, clientId: Identifier) =>
        request({ url: '/system/user/authRole/' + segment(id), method: 'get', params: { clientId } }),
      updateAuthRoles: (params: Query) => request({ url: '/system/user/authRole', method: 'put', params }),
      listByDepartment: (id: Identifier) => request({ url: '/system/user/list/dept/' + segment(id), method: 'get' }),
      departmentTree: () => request({ url: '/system/user/deptTree', method: 'get' })
    }),
    menus: Object.freeze({
      list: (params?: Query) => request({ url: '/system/menu/list', method: 'get', params }),
      get: (id: Identifier) => request({ url: '/system/menu/' + segment(id), method: 'get' }),
      tree: (clientId?: Identifier) => request({ url: '/system/menu/treeselect', method: 'get', params: { clientId } }),
      roleTree: (id: Identifier) => request({ url: '/system/menu/roleMenuTreeselect/' + segment(id), method: 'get' }),
      add: (data: Payload) => request({ url: '/system/menu', method: 'post', data }),
      update: (data: Payload) => request({ url: '/system/menu', method: 'put', data }),
      delete: (id: Identifier) => request({ url: '/system/menu/' + segment(id), method: 'delete' }),
      cascadeDelete: (ids: readonly Identifier[]) =>
        request({ url: '/system/menu/cascade/' + segment(ids), method: 'delete' })
    }),
    departments: Object.freeze({
      list: (params?: Query) => request({ url: '/system/dept/list', method: 'get', params }),
      options: (ids: readonly Identifier[]) =>
        request({ url: '/system/dept/optionselect?deptIds=' + segment(ids), method: 'get' }),
      excludeChildren: (id: Identifier) => request({ url: '/system/dept/list/exclude/' + segment(id), method: 'get' }),
      get: (id: Identifier) => request({ url: '/system/dept/' + segment(id), method: 'get' }),
      add: (data: Payload) => request({ url: '/system/dept', method: 'post', data }),
      update: (data: Payload) => request({ url: '/system/dept', method: 'put', data }),
      delete: (id: Identifier) => request({ url: '/system/dept/' + segment(id), method: 'delete' })
    }),
    posts: Object.freeze({
      list: (params?: Query) => request<PageResult>({ url: '/system/post/list', method: 'get', params }),
      get: (id: Identifier) => request({ url: '/system/post/' + segment(id), method: 'get' }),
      options: (deptId?: Identifier, postIds?: readonly Identifier[]) =>
        request({ url: '/system/post/optionselect', method: 'get', params: { deptId, postIds } }),
      add: (data: Payload) => request({ url: '/system/post', method: 'post', data }),
      update: (data: Payload) => request({ url: '/system/post', method: 'put', data }),
      delete: (ids: IdentifierList) => request({ url: '/system/post/' + segment(ids), method: 'delete' }),
      departmentTree: () => request({ url: '/system/post/deptTree', method: 'get' })
    })
  });
}
