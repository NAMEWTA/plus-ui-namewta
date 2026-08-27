import type { RouteRecordRaw } from 'vue-router';
import type { AxiosPromise } from '@/utils/api-types';
import { identityAccessService } from '@/api/login';

export async function getRouters(): AxiosPromise<RouteRecordRaw[]> {
  return {
    code: 200,
    data: (await identityAccessService.getMenus()) as unknown as RouteRecordRaw[],
    msg: '操作成功'
  } as never;
}
