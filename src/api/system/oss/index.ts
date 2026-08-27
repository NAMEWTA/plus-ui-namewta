import type { OssCompletedPart, OssQuery, OssUploadInitRequest } from './types';
import { systemAdminService } from '../client/runtime';

const oss = systemAdminService.resources.oss;

export const listOss = (query: OssQuery) => oss.list(query);
export const listByIds = (ossId: string | number | Array<string | number>) => oss.listByIds(ossId);
export const initOssUpload = (data: OssUploadInitRequest) => oss.initUpload(data);
export const signOssUploadParts = (uploadToken: string, partNumbers: number[]) =>
  oss.signParts(uploadToken, partNumbers);
export const resumeOssUpload = (uploadToken: string, fingerprint: string) => oss.resumeUpload(uploadToken, fingerprint);
export const completeOssUpload = (uploadToken: string, parts: OssCompletedPart[] = []) =>
  oss.completeUpload(uploadToken, parts);
export const abortOssUpload = (uploadToken: string) => oss.abortUpload(uploadToken);
export const getOssDownloadUrl = (ossId: string | number) => oss.downloadUrl(ossId);
export const delOss = (ossId: string | number | Array<string | number>) => oss.delete(ossId);
