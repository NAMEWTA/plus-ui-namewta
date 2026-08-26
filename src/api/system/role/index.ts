import type { UserQuery } from '../user/types';
import type { RoleQuery } from './types';
import { systemAdminService } from '../client/runtime';

export const listRole = (query: RoleQuery) => systemAdminService.roles.list(query as never);
export const optionSelect = (ids: (number | string)[]) => systemAdminService.roles.options(ids);
export const getRole = (id: string | number) => systemAdminService.roles.get(id);
export const addRole = (data: Record<string, unknown>) => systemAdminService.roles.add(data);
export const updateRole = (data: Record<string, unknown>) => systemAdminService.roles.update(data);
export const updateRolePermission = (data: Record<string, unknown>) => systemAdminService.roles.updatePermission(data);
export const changeRoleStatus = (id: string | number, status: string) =>
  systemAdminService.roles.changeStatus?.(id, status);
export const delRole = (id: Array<string | number> | string | number) => systemAdminService.roles.delete(id);
export const allocatedUserList = (query: UserQuery) => systemAdminService.roles.allocatedUsers(query as never);
export const unallocatedUserList = (query: UserQuery) => systemAdminService.roles.unallocatedUsers(query as never);
export const authUserCancel = (data: Record<string, unknown>) => systemAdminService.roles.cancelUser(data);
export const authUserCancelAll = (data: Record<string, unknown>) => systemAdminService.roles.cancelUsers(data);
export const authUserSelectAll = (data: Record<string, unknown>) => systemAdminService.roles.selectUsers(data);
export const deptTreeSelect = (id: string | number) => systemAdminService.roles.departmentTree(id);

export default { optionSelect, listRole };
