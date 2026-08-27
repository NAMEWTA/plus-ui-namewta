import type { PostForm, PostQuery } from './types';
import { systemAdminService } from '../client/runtime';

export const listPost = (query: PostQuery) => systemAdminService.posts.list(query as never);
export const getPost = (id: string | number) => systemAdminService.posts.get(id);
export const optionselect = (deptId?: number | string, postIds?: (number | string)[]) =>
  systemAdminService.posts.options(deptId, postIds);
export const addPost = (data: PostForm) => systemAdminService.posts.add(data as never);
export const updatePost = (data: PostForm) => systemAdminService.posts.update(data as never);
export const delPost = (id: string | number | (string | number)[]) => systemAdminService.posts.delete(id);
export const deptTreeSelect = () => systemAdminService.posts.departmentTree();
