import { systemAdminService } from '../client/runtime';
export const getMessageBox = () => systemAdminService.resources.messages.box();
