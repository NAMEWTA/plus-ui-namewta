export type { NotifyDeliveryVO, NotifyDetailVO, NotifyListVO, NotifyLogVO, NotifyQuery } from './types';

export const systemMonitorNotifyResource = Object.freeze({
  controller: 'SysNotifyController',
  basePath: '/monitor/notify'
});
