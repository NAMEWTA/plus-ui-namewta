import type { LoadingInstance } from 'element-plus';
import axiosModule from 'axios';
import { getOssDownloadUrl } from '@/api/system/oss';
import errorCode from '@/utils/errorCode';
import { extractErrorMessage, globalHeaders } from '@/utils/request';
import { blobValidate } from '@/utils/ruoyi';
import { saveBlob } from '@/utils/save';

const axios = axiosModule as any;
const baseURL = import.meta.env.VITE_APP_BASE_API;
let downloadLoadingInstance: LoadingInstance | undefined;
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
      const isBlob = blobValidate(res.data);
      if (isBlob) {
        const blob = new Blob([res.data], { type: 'application/zip' });
        saveBlob(blob, name);
      } else {
        this.printErrMsg(res.data);
      }
      downloadLoadingInstance?.close();
    } catch (r) {
      console.error(r);
      const errMsg = await extractErrorMessage(r);
      ElMessage.error(errMsg || '下载文件出现错误，请联系管理员！');
      downloadLoadingInstance?.close();
    }
  },
  async printErrMsg(data: any) {
    const resText = await data.text();
    const rspObj = JSON.parse(resText);
    const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
    ElMessage.error(errMsg);
  }
};
