import { beforeEach, describe, expect, it, vi } from 'vitest';
import { systemService } from '@/application/services';
import { createOssFileFingerprint } from '@/utils/oss/fingerprint';
import { getOssResumeRecord, putOssResumeRecord, removeOssResumeRecord } from '@/utils/oss/resumeStore';
import { transferToOss } from '@/utils/oss/transport';
import { getDirectOssUploadErrorMessage, uploadDirectToOss } from './useDirectOssUpload';

vi.mock('@/application/services', () => ({
  systemService: {
    resources: {
      oss: {
        abortUpload: vi.fn(),
        completeUpload: vi.fn(),
        downloadUrl: vi.fn(),
        initUpload: vi.fn(),
        resumeUpload: vi.fn(),
        signParts: vi.fn()
      }
    }
  }
}));
vi.mock('@/utils/oss/fingerprint', () => ({ createOssFileFingerprint: vi.fn() }));
vi.mock('@/utils/oss/resumeStore', () => ({
  getOssResumeRecord: vi.fn(),
  putOssResumeRecord: vi.fn(),
  removeOssResumeRecord: vi.fn()
}));
vi.mock('@/utils/oss/transport', () => ({ transferToOss: vi.fn() }));

const ossService = systemService.resources.oss;
const completeOssUpload = ossService.completeUpload;
const getOssDownloadUrl = ossService.downloadUrl;
const initOssUpload = ossService.initUpload;
const resumeOssUpload = ossService.resumeUpload;
const signOssUploadParts = ossService.signParts;

const file = () =>
  new File([new Uint8Array([1, 2, 3, 4, 5, 6])], 'archive.bin', {
    type: 'application/octet-stream',
    lastModified: 1
  });

const signedPart = (partNumber: number, suffix = 'a') => ({
  partNumber,
  method: 'PUT',
  url: `https://oss.test/part-${partNumber}-${suffix}`,
  requiredHeaders: {},
  expiresAt: '2099-01-01T00:00:00Z'
});

describe('direct OSS upload state machine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createOssFileFingerprint).mockResolvedValue('fingerprint');
    vi.mocked(getOssResumeRecord).mockResolvedValue(undefined);
    vi.mocked(putOssResumeRecord).mockResolvedValue(1);
    vi.mocked(removeOssResumeRecord).mockResolvedValue(undefined);
    vi.mocked(getOssDownloadUrl).mockResolvedValue({ data: { url: 'https://oss.test/download' } } as never);
    vi.mocked(completeOssUpload).mockResolvedValue({ data: '9001' } as never);
  });

  it('re-signs only a failed part and completes with every successful ETag', async () => {
    vi.mocked(initOssUpload).mockResolvedValue({
      data: {
        uploadToken: 'token-1',
        mode: 'MULTIPART',
        expiresAt: '2099-01-01T00:00:00Z',
        partSize: 3,
        partCount: 2
      }
    } as never);
    vi.mocked(signOssUploadParts)
      .mockResolvedValueOnce({ data: { parts: [signedPart(1), signedPart(2)] } } as never)
      .mockResolvedValueOnce({ data: { parts: [signedPart(1, 'retry')] } } as never);
    vi.mocked(transferToOss).mockImplementation(async request => {
      if (request.url.endsWith('part-1-a')) throw new Error('expired signature');
      return request.url.endsWith('part-1-retry') ? 'etag-1' : 'etag-2';
    });

    const result = await uploadDirectToOss(file(), { signal: new AbortController().signal });

    expect(signOssUploadParts).toHaveBeenNthCalledWith(1, 'token-1', [1, 2]);
    expect(signOssUploadParts).toHaveBeenNthCalledWith(2, 'token-1', [1]);
    expect(completeOssUpload).toHaveBeenCalledWith('token-1', [
      { partNumber: 1, eTag: 'etag-1' },
      { partNumber: 2, eTag: 'etag-2' }
    ]);
    expect(result).toEqual({ ossId: '9001', fileName: 'archive.bin', url: 'https://oss.test/download' });
  });

  it('resumes a matching session and uploads only missing parts', async () => {
    vi.mocked(getOssResumeRecord).mockResolvedValue({
      fingerprint: 'fingerprint',
      uploadToken: 'token-2',
      expiresAt: '2099-01-01T00:00:00Z',
      fileName: 'archive.bin',
      fileSize: 6,
      contentType: 'application/octet-stream'
    });
    vi.mocked(resumeOssUpload).mockResolvedValue({
      data: {
        uploadToken: 'token-2',
        mode: 'MULTIPART',
        fileName: 'archive.bin',
        fileSize: 6,
        contentType: 'application/octet-stream',
        partSize: 3,
        partCount: 2,
        expiresAt: '2099-01-01T00:00:00Z',
        uploadedParts: [{ partNumber: 1, eTag: 'etag-1', size: 3 }]
      }
    } as never);
    vi.mocked(signOssUploadParts).mockResolvedValue({ data: { parts: [signedPart(2)] } } as never);
    vi.mocked(transferToOss).mockResolvedValue('etag-2');

    await uploadDirectToOss(file(), { signal: new AbortController().signal });

    expect(initOssUpload).not.toHaveBeenCalled();
    expect(signOssUploadParts).toHaveBeenCalledOnce();
    expect(signOssUploadParts).toHaveBeenCalledWith('token-2', [2]);
    expect(transferToOss).toHaveBeenCalledOnce();
    expect(completeOssUpload).toHaveBeenCalledWith('token-2', [
      { partNumber: 1, eTag: 'etag-1' },
      { partNumber: 2, eTag: 'etag-2' }
    ]);
  });

  it('reconciles a completed session without uploading the file again', async () => {
    vi.mocked(getOssResumeRecord).mockResolvedValue({
      fingerprint: 'fingerprint',
      uploadToken: 'token-completed',
      expiresAt: '2099-01-01T00:00:00Z',
      fileName: 'archive.bin',
      fileSize: 6,
      contentType: 'application/octet-stream'
    });
    vi.mocked(resumeOssUpload).mockResolvedValue({
      data: {
        uploadToken: 'token-completed',
        mode: 'SINGLE',
        state: 'COMPLETED',
        completedOssId: '9001',
        fileName: 'archive.bin',
        fileSize: 6,
        contentType: 'application/octet-stream',
        partSize: 0,
        partCount: 0,
        expiresAt: '2099-01-01T00:00:00Z',
        uploadedParts: []
      }
    } as never);

    const result = await uploadDirectToOss(file(), { signal: new AbortController().signal });

    expect(initOssUpload).not.toHaveBeenCalled();
    expect(transferToOss).not.toHaveBeenCalled();
    expect(completeOssUpload).not.toHaveBeenCalled();
    expect(removeOssResumeRecord).toHaveBeenCalledOnce();
    expect(result).toEqual({ ossId: '9001', fileName: 'archive.bin', url: 'https://oss.test/download' });
  });

  it('surfaces local errors without duplicating handled request errors', () => {
    expect(getDirectOssUploadErrorMessage(new Error('完成 OSS 上传失败'), '上传文件失败')).toBe('完成 OSS 上传失败');
    expect(
      getDirectOssUploadErrorMessage(Object.assign(new Error('服务端已提示'), { isHandled: true }), '上传文件失败')
    ).toBeUndefined();
    expect(getDirectOssUploadErrorMessage('unknown failure', '上传文件失败')).toBe('上传文件失败');
  });
});
