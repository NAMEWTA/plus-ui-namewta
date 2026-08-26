import type { DeptForm, DeptQuery } from './types';
import { systemAdminService } from '../client/runtime';

export const listDept = (query?: DeptQuery) => systemAdminService.departments.list(query as never);
export const optionSelect = (ids: (number | string)[]) => systemAdminService.departments.options(ids);
export const listDeptExcludeChild = (id: string | number) => systemAdminService.departments.excludeChildren(id);
export const getDept = (id: string | number) => systemAdminService.departments.get(id);
export const addDept = (data: DeptForm) => systemAdminService.departments.add(data as never);
export const updateDept = (data: DeptForm) => systemAdminService.departments.update(data as never);
export const delDept = (id: number | string) => systemAdminService.departments.delete(id);
