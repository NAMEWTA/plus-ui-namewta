import { createWorkflowDefinitionService, type CategoryForm, type CategoryQuery } from '@namewta/domain-workflow';
import request from '@/utils/request';

const service = createWorkflowDefinitionService({ request: config => request(config) });

export const listCategory = (query?: CategoryQuery) => service.listCategories(query);
export const getCategory = (categoryId: string | number) => service.getCategory(categoryId);
export const addCategory = (data: CategoryForm) => service.addCategory(data);
export const updateCategory = (data: CategoryForm) => service.updateCategory(data);
export const delCategory = (categoryId: string | number | Array<string | number>) => service.deleteCategory(categoryId);
export const categoryTree = (query?: CategoryForm) => service.categoryTree(query);
