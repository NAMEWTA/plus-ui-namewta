import { systemAdminService } from '../client/runtime';
export const authRouterUrl = (source: string) => systemAdminService.resources.social.bindingUrl(source);
export const authUnlock = (authId: string) => systemAdminService.resources.social.unlock(authId);
export const getAuthList = () => systemAdminService.resources.social.list();
