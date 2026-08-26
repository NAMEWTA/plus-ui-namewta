import type { LoadingInstance } from 'element-plus';
import axiosModule from 'axios';
import { getOssDownloadUrl } from '@/api/system/oss';
import errorCode from '@/utils/errorCode';
import { extractErrorMessage, globalHeaders } from '@/utils/request';
import { saveBlob } from '@/utils/save';

const axios = axiosModule as any;
const baseURL = import.meta.env.VITE_APP_BASE_API;
let downloadLoadingInstance: LoadingInstance | undefined;

const zipSignatures = new Set(['80,75,3,4', '80,75,5,6', '80,75,7,8']);
const sanitizedMessage = (value: unknown) =>
  [...String(value ?? '')]
    .map(character => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127 ? ' ' : character;
    })
    .join('')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

export async function isZipPayload(data: unknown): Promise<boolean> {
  const bytes =
    data instanceof Blob
      ? new Uint8Array(await data.slice(0, 4).arrayBuffer())
      : data instanceof ArrayBuffer
        ? new Uint8Array(data.slice(0, 4))
        : ArrayBuffer.isView(data)
          ? new Uint8Array(data.buffer, data.byteOffset, Math.min(data.byteLength, 4))
          : new Uint8Array();
  return bytes.byteLength >= 4 && zipSignatures.has(Array.from(bytes).join(','));
}
export default {
  async oss(ossId: string | number) {
    downloadLoadingInstance = ElLoading.service({
      text: '正在下载数据，请稍候',
      background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
      const response = await getOssDownloadUrl(ossId);
      const download = response.data;
      if (!download?.url) throw new Error('未取得 OSS 下载授权');
      const link = document.createElement('a');
      link.href = download.url;
      link.download = download.fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (r) {
      console.error(r);
      const errMsg = await extractErrorMessage(r);
      ElMessage.error(errMsg || '下载文件出现错误，请联系管理员！');
    } finally {
      downloadLoadingInstance?.close();
    }
  },
  async zip(url: string, name: string) {
    url = baseURL + url;
    downloadLoadingInstance = ElLoading.service({
      text: '正在下载数据，请稍候',
      background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
      const res = await axios({
        method: 'get',
        url: url,
        responseType: 'blob',
        headers: globalHeaders()
      });
      if (await isZipPayload(res.data)) {
        const blob = new Blob([res.data], { type: 'application/zip' });
        saveBlob(blob, name);
      } else {
        await this.printErrMsg(res.data);
      }
    } catch (r) {
      const errMsg = await extractErrorMessage(r);
      ElMessage.error(sanitizedMessage(errMsg) || '下载文件出现错误，请联系管理员！');
    } finally {
      downloadLoadingInstance?.close();
    }
  },
  async printErrMsg(data: any) {
    let message = '';
    try {
      const text = data instanceof Blob ? await data.text() : String(data ?? '');
      const response = JSON.parse(text) as { code?: keyof typeof errorCode; msg?: unknown };
      message = errorCode[response.code ?? 'default'] || sanitizedMessage(response.msg);
    } catch {
      message = '';
    }
    ElMessage.error(sanitizedMessage(message) || '下载文件出现错误，请联系管理员！');
  }
};
