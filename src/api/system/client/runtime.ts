import { createSystemAdminService } from '@namewta/domain-system-admin';
import request from '@/utils/request';

export const systemAdminService = createSystemAdminService({
  request: config => request(config) as never
});
