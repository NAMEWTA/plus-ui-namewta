import type { LoginInfoQuery } from './types';
import { operationsService } from '../runtime';

// 查询登录日志列表
export const list = (query: LoginInfoQuery) => operationsService.loginInfo.list(query);

// 删除登录日志
export const delLoginInfo = (infoId: string | number | Array<string | number>) =>
  operationsService.loginInfo.delete(infoId);

// 解锁用户登录状态
export const unlockLoginInfo = (userName: string | Array<string>) => operationsService.loginInfo.unlock(userName);

// 清空登录日志
export const cleanLoginInfo = () => operationsService.loginInfo.clean();
