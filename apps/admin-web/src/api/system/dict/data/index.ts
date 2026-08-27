import type { DictDataForm, DictDataQuery } from './types';
import { systemAdminService } from '../../client/runtime';
const service = systemAdminService.resources.dictData;
export const getDicts = (type: string) => service.byType(type);
export const listData = (query: DictDataQuery) => service.list(query);
export const getData = (id: string | number) => service.get(id);
export const addData = (data: DictDataForm) => service.add(data);
export const updateData = (data: DictDataForm) => service.update(data);
export const delData = (ids: string | number | Array<string | number>) => service.delete(ids);
