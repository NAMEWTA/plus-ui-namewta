import type { DomainModule } from '@namewta/platform-app-runtime';

export const notifyDomainModule: DomainModule = Object.freeze({
  id: 'notify',
  backendModules: ['ruoyi-notify'],
  capabilities: ['notification-control-plane', 'notification-monitor']
});

export { createNotificationService } from './transport';
export type {
  NotificationChannel,
  NotificationDelivery,
  NotificationDeliveryQuery,
  NotificationSnapshot,
  NotificationStatus,
  NotifyInboxMessage,
  NotifyNotice,
  NotifyNoticeQuery,
  NotifyRecipientType,
  NotifyUserCandidate,
  NotifyUserCandidatePage,
  NotifyUserTypeOption
} from './types';
