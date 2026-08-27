import type { OnlineQuery } from './types';
import { operationsService } from '../runtime';

// 查询在线用户列表
export const list = (query: OnlineQuery) => operationsService.online.list(query);

// 强退用户
export const forceLogout = (tokenId: string) => operationsService.online.forceLogout(tokenId);

// 获取当前用户登录在线设备
export const getOnline = () => operationsService.online.current();

// 删除当前在线设备
export const delOnline = (tokenId: string) => operationsService.online.removeCurrent(tokenId);
