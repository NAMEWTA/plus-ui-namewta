import type { NoticeForm, NoticeQuery } from './types';
import { systemAdminService } from '../client/runtime';
const service = systemAdminService.resources.notices;
export const listNotice = (query: NoticeQuery) => service.list(query);
export const getNotice = (id: string | number) => service.get(id);
export const getNoticeAttachmentDownloadUrls = (id: string | number) => service.attachmentUrls(id);
export const addNotice = (data: NoticeForm) => service.add(data);
export const updateNotice = (data: NoticeForm) => service.update(data);
export const delNotice = (ids: string | number | Array<string | number>) => service.delete(ids);
