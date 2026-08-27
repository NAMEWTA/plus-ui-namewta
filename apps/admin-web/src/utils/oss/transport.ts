import type { OssPresignedRequest } from '@/api/system/oss/types';

export interface OssTransferProgress {
  loaded: number;
  total: number;
}

/** 独立 XHR 数据面，只发送签名合同要求的 Header。 */
export function transferToOss(
  request: OssPresignedRequest,
  body: Blob,
  signal: AbortSignal,
  onProgress?: (progress: OssTransferProgress) => void
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const cleanup = () => signal.removeEventListener('abort', abort);
    xhr.open(request.method, request.url, true);
    Object.entries(request.requiredHeaders || {}).forEach(([name, value]) => xhr.setRequestHeader(name, value));
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) {
        onProgress?.({ loaded: event.loaded, total: event.total });
      }
    };
    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.getResponseHeader('ETag') || undefined);
      } else {
        reject(new Error(`OSS 请求失败: HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => {
      cleanup();
      reject(new Error('OSS 网络请求失败'));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new DOMException('上传已取消', 'AbortError'));
    };
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) {
      abort();
      return;
    }
    xhr.send(body);
  });
}
