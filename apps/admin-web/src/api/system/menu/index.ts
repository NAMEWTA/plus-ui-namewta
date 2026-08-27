import type { MenuForm, MenuQuery } from './types';
import { systemAdminService } from '../client/runtime';

export const listMenu = (query?: MenuQuery) => systemAdminService.menus.list(query as never);
export const getMenu = (id: string | number) => systemAdminService.menus.get(id);
export const treeselect = (clientId?: string | number) => systemAdminService.menus.tree(clientId);
export const roleMenuTreeselect = (id: string | number) => systemAdminService.menus.roleTree(id);
export const addMenu = (data: MenuForm) => systemAdminService.menus.add(data as never);
export const updateMenu = (data: MenuForm) => systemAdminService.menus.update(data as never);
export const delMenu = (id: string | number) => systemAdminService.menus.delete(id);
export const cascadeDelMenu = (ids: Array<string | number>) => systemAdminService.menus.cascadeDelete(ids);
