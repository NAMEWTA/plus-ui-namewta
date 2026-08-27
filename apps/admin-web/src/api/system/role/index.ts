import type { RoleUserAssignment, RoleUserCancellation } from '@namewta/domain-system-admin';
import type { UserQuery } from '../user/types';
import type { RoleForm, RoleQuery } from './types';
import { systemAdminService } from '../client/runtime';

export const listRole = (query: RoleQuery) => systemAdminService.roles.list(query as never);
export const optionSelect = (ids: (number | string)[]) => systemAdminService.roles.options(ids);
export const getRole = (id: string | number) => systemAdminService.roles.get(id);
export const addRole = (data: RoleForm) => systemAdminService.roles.add(data);
export const updateRole = (data: RoleForm) => systemAdminService.roles.update(data);
export const updateRolePermission = (data: RoleForm) => systemAdminService.roles.updatePermission(data);
export const changeRoleStatus = (id: string | number, status: string) =>
  systemAdminService.roles.changeStatus?.(id, status);
export const delRole = (id: Array<string | number> | string | number) => systemAdminService.roles.delete(id);
export const allocatedUserList = (query: UserQuery) => systemAdminService.roles.allocatedUsers(query as never);
export const unallocatedUserList = (query: UserQuery) => systemAdminService.roles.unallocatedUsers(query as never);
export const authUserCancel = (data: RoleUserCancellation) => systemAdminService.roles.cancelUser(data);
export const authUserCancelAll = (data: RoleUserAssignment) => systemAdminService.roles.cancelUsers(data);
export const authUserSelectAll = (data: RoleUserAssignment) => systemAdminService.roles.selectUsers(data);
export const deptTreeSelect = (id: string | number) => systemAdminService.roles.departmentTree(id);

export default { optionSelect, listRole };
