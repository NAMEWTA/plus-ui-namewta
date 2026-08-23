import type { OssDownloadUrl } from '@/api/system/oss/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { NotifyDetailVO, NotifyListVO, NotifyQuery } from './types';

export function listNotify(query: NotifyQuery): AxiosPromise<PageResult<NotifyListVO>> {
  return request({
    url: '/monitor/notify/list',
    method: 'get',
    params: query
  });
}

export function getNotifyDetail(notifyLogId: string | number): AxiosPromise<NotifyDetailVO> {
  return request({
    url: `/monitor/notify/${notifyLogId}`,
    method: 'get'
  });
}

export function getNotifyAttachmentDownloadUrl(
  notifyLogId: string | number,
  ossId: string | number
): AxiosPromise<OssDownloadUrl> {
  return request({
    url: `/monitor/notify/${notifyLogId}/attachments/${ossId}/download-url`,
    method: 'get'
  });
}

export function delNotify(notifyLogIds: string | number | Array<string | number>) {
  return request({
    url: `/monitor/notify/${notifyLogIds}`,
    method: 'delete'
  });
}

export function cleanNotify() {
  return request({
    url: '/monitor/notify/clean',
    method: 'delete'
  });
}
