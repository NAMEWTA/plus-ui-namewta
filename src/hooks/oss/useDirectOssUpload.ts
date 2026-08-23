import type { UploadProgressEvent, UploadRequestOptions } from 'element-plus';
import type {
  OssCompletedPart,
  OssSignedPart,
  OssUploadInitResponse,
  OssUploadResumeResponse,
  OssUploadVO
} from '@/api/system/oss/types';
import {
  abortOssUpload,
  completeOssUpload,
  getOssDownloadUrl,
  initOssUpload,
  resumeOssUpload,
  signOssUploadParts
} from '@/api/system/oss';
import { getToken } from '@/utils/auth';
import { createOssFileFingerprint } from '@/utils/oss/fingerprint';
import { getOssResumeRecord, putOssResumeRecord, removeOssResumeRecord } from '@/utils/oss/resumeStore';
import { transferToOss } from '@/utils/oss/transport';

const DEFAULT_POLICY = 'general';
const SIGN_WINDOW = 8;
const MAX_PART_ATTEMPTS = 3;

export interface DirectUploadOptions {
  signal: AbortSignal;
  onProgress?: (percent: number) => void;
  policy?: string;
}

async function resumeKey(fingerprint: string, policy: string) {
  const identity = `${import.meta.env.VITE_APP_CLIENT_ID}:${getToken() || 'anonymous'}:${policy}:${fingerprint}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity));
  return Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
}

function requireData<T>(value: T | undefined, message: string): T {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
  return value;
}

async function safeRemoveResume(fingerprint: string) {
  try {
    await removeOssResumeRecord(fingerprint);
  } catch {
    // IndexedDB 不可用时不阻断上传。
  }
}

async function findResume(file: File, fingerprint: string, storageKey: string) {
  let record;
  try {
    record = await getOssResumeRecord(storageKey);
  } catch {
    return undefined;
  }
  if (!record || Date.parse(record.expiresAt) <= Date.now()) {
    await safeRemoveResume(storageKey);
    return undefined;
  }
  try {
    const response = await resumeOssUpload(record.uploadToken, fingerprint);
    const session = response.data;
    if (!session || session.fileName !== file.name || session.fileSize !== file.size) {
      await safeRemoveResume(storageKey);
      return undefined;
    }
    return session;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (
      ['SESSION_NOT_FOUND', 'SESSION_EXPIRED', 'INVALID_STATE', 'FINGERPRINT_MISMATCH', 'SESSION_OWNER_MISMATCH'].some(
        code => message.includes(code)
      ) ||
      ['上传会话不存在', '上传会话已过期', '上传会话不可再使用', '文件指纹不匹配', '上传会话不属于'].some(text =>
        message.includes(text)
      )
    ) {
      await safeRemoveResume(storageKey);
      return undefined;
    }
    throw error;
  }
}

async function initialize(file: File, fingerprint: string, storageKey: string, policy: string) {
  const response = await initOssUpload({
    policy,
    fileName: file.name,
    fileSize: file.size,
    contentType: file.type || 'application/octet-stream',
    fingerprint
  });
  const session = requireData(response.data, '初始化 OSS 上传失败');
  try {
    await putOssResumeRecord({
      fingerprint: storageKey,
      uploadToken: session.uploadToken,
      expiresAt: session.expiresAt,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream'
    });
  } catch {
    // IndexedDB 不可用时仍允许当前页面完成上传。
  }
  return session;
}

async function uploadSingle(file: File, session: OssUploadInitResponse, options: DirectUploadOptions) {
  const request = requireData(session.presignedRequest, 'SINGLE 上传未返回签名请求');
  await transferToOss(request, file, options.signal, progress => {
    options.onProgress?.((progress.loaded / file.size) * 100);
  });
  return [];
}

async function uploadSignedPart(
  file: File,
  uploadToken: string,
  partSize: number,
  signed: OssSignedPart,
  loadedByPart: Map<number, number>,
  options: DirectUploadOptions
) {
  const start = (signed.partNumber - 1) * partSize;
  const body = file.slice(start, Math.min(file.size, start + partSize));
  let request = signed;
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_PART_ATTEMPTS; attempt++) {
    try {
      const eTag = await transferToOss(request, body, options.signal, progress => {
        loadedByPart.set(signed.partNumber, progress.loaded);
        const loaded = Array.from(loadedByPart.values()).reduce((total, value) => total + value, 0);
        options.onProgress?.((loaded / file.size) * 100);
      });
      if (!eTag) {
        throw new Error('OSS 响应未暴露 ETag');
      }
      loadedByPart.set(signed.partNumber, body.size);
      return { partNumber: signed.partNumber, eTag };
    } catch (error) {
      if (options.signal.aborted) throw error;
      lastError = error;
      loadedByPart.set(signed.partNumber, 0);
      if (attempt < MAX_PART_ATTEMPTS) {
        const response = await signOssUploadParts(uploadToken, [signed.partNumber]);
        request = requireData(response.data?.parts?.[0], 'Part 重新签名失败');
      }
    }
  }
  throw lastError;
}

async function uploadMultipart(
  file: File,
  session: OssUploadInitResponse | OssUploadResumeResponse,
  options: DirectUploadOptions
) {
  const partSize = requireData(session.partSize, 'Multipart partSize 缺失');
  const partCount = requireData(session.partCount, 'Multipart partCount 缺失');
  const uploaded = 'uploadedParts' in session ? session.uploadedParts : [];
  const completed = new Map<number, OssCompletedPart>(
    uploaded.map(part => [part.partNumber, { partNumber: part.partNumber, eTag: part.eTag }])
  );
  const loadedByPart = new Map<number, number>(uploaded.map(part => [part.partNumber, part.size]));
  const missing = Array.from({ length: partCount }, (_, index) => index + 1).filter(part => !completed.has(part));
  const uploadToken = session.uploadToken;
  let reportedProgress =
    (Array.from(loadedByPart.values()).reduce((total, value) => total + value, 0) / file.size) * 100;
  options.onProgress?.(reportedProgress);
  const stableOptions: DirectUploadOptions = {
    ...options,
    onProgress: percent => {
      reportedProgress = Math.max(reportedProgress, percent);
      options.onProgress?.(reportedProgress);
    }
  };

  for (let offset = 0; offset < missing.length; offset += SIGN_WINDOW) {
    const numbers = missing.slice(offset, offset + SIGN_WINDOW);
    const response = await signOssUploadParts(uploadToken, numbers);
    const signedParts = requireData(response.data?.parts, 'Part 签名失败');
    const settled = await Promise.allSettled(
      signedParts.map(part => uploadSignedPart(file, uploadToken, partSize, part, loadedByPart, stableOptions))
    );
    const failure = settled.find(item => item.status === 'rejected');
    settled.forEach(item => {
      if (item.status === 'fulfilled') completed.set(item.value.partNumber, item.value);
    });
    if (failure?.status === 'rejected') throw failure.reason;
  }
  return Array.from(completed.values()).toSorted((left, right) => left.partNumber - right.partNumber);
}

export async function uploadDirectToOss(file: File, options: DirectUploadOptions): Promise<OssUploadVO> {
  const fingerprint = await createOssFileFingerprint(file);
  const policy = options.policy || DEFAULT_POLICY;
  const storageKey = await resumeKey(fingerprint, policy);
  let uploadToken: string | undefined;
  try {
    const session =
      (await findResume(file, fingerprint, storageKey)) || (await initialize(file, fingerprint, storageKey, policy));
    uploadToken = session.uploadToken;
    const parts =
      session.mode === 'SINGLE'
        ? await uploadSingle(file, session as OssUploadInitResponse, options)
        : await uploadMultipart(file, session, options);
    const complete = await completeOssUpload(session.uploadToken, parts);
    const ossId = requireData(complete.data, '完成 OSS 上传失败');
    await safeRemoveResume(storageKey);
    const download = await getOssDownloadUrl(ossId).catch(() => undefined);
    return {
      ossId,
      fileName: file.name,
      url: download?.data?.url || URL.createObjectURL(file)
    };
  } catch (error) {
    if (options.signal.aborted && uploadToken) {
      await abortOssUpload(uploadToken).catch(() => undefined);
      await safeRemoveResume(storageKey);
    }
    throw error;
  }
}

function progressEvent(percent: number) {
  const event = new ProgressEvent('progress', {
    lengthComputable: true,
    loaded: percent,
    total: 100
  }) as UploadProgressEvent;
  event.percent = Math.min(100, Math.max(0, percent));
  return event;
}

export function directOssUploadRequest(options: UploadRequestOptions, policy = DEFAULT_POLICY): XMLHttpRequest {
  const controller = new AbortController();
  const handle = new XMLHttpRequest();
  handle.abort = () => controller.abort();
  void uploadDirectToOss(options.file, {
    signal: controller.signal,
    policy,
    onProgress: percent => options.onProgress(progressEvent(percent))
  }).then(options.onSuccess, error => options.onError(error));
  return handle;
}

export const createDirectOssUploadRequest = (policy: string) => (options: UploadRequestOptions) =>
  directOssUploadRequest(options, policy);
