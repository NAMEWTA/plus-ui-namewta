import type { NotifyQuery } from './types';
import { operationsService } from '../runtime';
export const listNotify = (query: NotifyQuery) => operationsService.notifications.list(query);
export const getNotifyDetail = (id: string | number) => operationsService.notifications.get(id);
export const getNotifyAttachmentDownloadUrl = (id: string | number, ossId: string | number) =>
  operationsService.notifications.attachmentUrl(id, ossId);
export const delNotify = (ids: string | number | Array<string | number>) => operationsService.notifications.delete(ids);
export const cleanNotify = () => operationsService.notifications.clean();
