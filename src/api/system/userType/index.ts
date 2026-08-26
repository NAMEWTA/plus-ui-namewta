import type { UserTypeForm, UserTypeQuery } from './types';
import { systemAdminService } from '../client/runtime';

export const listUserType = (query?: UserTypeQuery) => systemAdminService.userTypes.list(query as never);
export const getUserType = (id: string | number) => systemAdminService.userTypes.get(id);
export const optionselect = () => systemAdminService.userTypes.options();
export const addUserType = (data: UserTypeForm) => systemAdminService.userTypes.add(data as never);
export const updateUserType = (data: UserTypeForm) => systemAdminService.userTypes.update(data as never);
export const delUserType = (id: string | number | Array<string | number>) => systemAdminService.userTypes.delete(id);
