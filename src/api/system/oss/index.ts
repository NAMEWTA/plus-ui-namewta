import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type {
  OssCompletedPart,
  OssDownloadUrl,
  OssQuery,
  OssSignedPart,
  OssUploadInitRequest,
  OssUploadInitResponse,
  OssUploadResumeResponse,
  OssVO
} from './types';

// 查询OSS对象存储列表
export function listOss(query: OssQuery): AxiosPromise<PageResult<OssVO>> {
  return request({
    url: '/resource/oss/list',
    method: 'get',
    params: query
  });
}

// 查询OSS对象基于id串
export async function listByIds(ossId: string | number): AxiosPromise<OssVO[]> {
  const response = await request({
    url: '/resource/oss/listByIds/' + ossId,
    method: 'get'
  });
  if (response.data) {
    response.data = await Promise.all(
      response.data.map(async oss => {
        const download = await getOssDownloadUrl(oss.ossId).catch(() => undefined);
        return { ...oss, url: download?.data?.url || oss.url || '' };
      })
    );
  }
  return response;
}

export function initOssUpload(data: OssUploadInitRequest): AxiosPromise<OssUploadInitResponse> {
  return request({
    url: '/resource/oss/uploads',
    method: 'post',
    data
  });
}

export function signOssUploadParts(
  uploadToken: string,
  partNumbers: number[]
): AxiosPromise<{ parts: OssSignedPart[] }> {
  return request({
    url: `/resource/oss/uploads/${uploadToken}/parts/sign`,
    method: 'post',
    data: { partNumbers }
  });
}

export function resumeOssUpload(uploadToken: string, fingerprint: string): AxiosPromise<OssUploadResumeResponse> {
  return request({
    url: `/resource/oss/uploads/${uploadToken}/parts`,
    method: 'get',
    params: { fingerprint }
  });
}

export function completeOssUpload(uploadToken: string, parts: OssCompletedPart[] = []): AxiosPromise<string> {
  return request({
    url: `/resource/oss/uploads/${uploadToken}/complete`,
    method: 'post',
    data: { parts }
  });
}

export function abortOssUpload(uploadToken: string) {
  return request({
    url: `/resource/oss/uploads/${uploadToken}`,
    method: 'delete'
  });
}

export function getOssDownloadUrl(ossId: string | number): AxiosPromise<OssDownloadUrl> {
  return request({
    url: `/resource/oss/${ossId}/download-url`,
    method: 'get'
  });
}

// 删除OSS对象存储
export function delOss(ossId: string | number | Array<string | number>) {
  return request({
    url: '/resource/oss/' + ossId,
    method: 'delete'
  });
}
