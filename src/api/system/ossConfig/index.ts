import type { OssConfigForm, OssConfigQuery } from './types';
import { systemAdminService } from '../client/runtime';
const service = systemAdminService.resources.ossConfigs;
export const listOssConfig = (query: OssConfigQuery) => service.list(query);
export const getOssConfig = (id: string | number) => service.get(id);
export const addOssConfig = (data: OssConfigForm) => service.add(data);
export const updateOssConfig = (data: OssConfigForm) => service.update(data);
export const delOssConfig = (ids: string | number | Array<string | number>) => service.delete(ids);
export const changeOssConfigStatus = (id: string | number, status: string, key: string) =>
  service.changeStatus(id, status, key);
