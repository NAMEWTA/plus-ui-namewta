import type { UserForm, UserProfileForm, UserQuery } from './types';
import { systemAdminService } from '../client/runtime';

export const listUser = (query: UserQuery) => systemAdminService.users.list(query);
export const optionSelect = (ids: (number | string)[]) => systemAdminService.users.options(ids);
export const getUser = (id?: string | number, clientId?: string | number) => systemAdminService.users.get(id, clientId);
export const addUser = (data: UserForm) => systemAdminService.users.add(data as never);
export const updateUser = (data: UserForm) => systemAdminService.users.update(data as never);
export const delUser = (id: Array<string | number> | string | number) => systemAdminService.users.delete(id);
export const resetUserPwd = (id: string | number, password: string) =>
  systemAdminService.users.resetPassword(id, password);
export const changeUserStatus = (id: number | string, status: string) =>
  systemAdminService.users.changeStatus(id, status);
export const unlockUser = (id: number | string) => systemAdminService.users.unlock(id);
export const getUserProfile = () => systemAdminService.users.profile();
export const updateUserProfile = (data: UserProfileForm) => systemAdminService.users.updateProfile(data as never);
export const updateUserPwd = (oldPassword: string, newPassword: string) =>
  systemAdminService.users.updatePassword(oldPassword, newPassword);
export const getAuthRole = (id: string | number, clientId: string | number) =>
  systemAdminService.users.authRoles(id, clientId);
export const updateAuthRole = (data: { userId: string; roleIds: string; clientId: string | number }) =>
  systemAdminService.users.updateAuthRoles(data);
export const listUserByDeptId = (id: string | number) => systemAdminService.users.listByDepartment(id);
export const deptTreeSelect = () => systemAdminService.users.departmentTree();

export default {
  listUser,
  getUser,
  optionSelect,
  addUser,
  updateUser,
  delUser,
  resetUserPwd,
  changeUserStatus,
  unlockUser,
  getUserProfile,
  updateUserProfile,
  updateUserPwd,
  getAuthRole,
  updateAuthRole,
  deptTreeSelect,
  listUserByDeptId
};
