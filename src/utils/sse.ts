import { getToken } from '@/utils/auth';
import { ElNotification } from 'element-plus';
import { useNoticeStore } from '@/store/modules/notice';
import { parsePushMessage, PUSH_MESSAGE_TYPE, shouldAppendNotice } from '@/utils/push-message';

// 初始化
export const initSSE = (url: any) => {
  if (import.meta.env.VITE_APP_SSE === 'false') {
    return;
  }

  url = url + '?Authorization=Bearer ' + getToken() + '&clientid=' + import.meta.env.VITE_APP_CLIENT_ID;
  const { data, error } = useEventSource(url, [], {
    autoReconnect: {
      retries: 5,
      delay: 5000,
      onFailed() {
        console.log('Failed to connect after 5 retries');
      }
    }
  });

  watch(error, () => {
    console.log('SSE connection error:', error.value);
    error.value = null;
  });

  watch(data, () => {
    if (!data.value) return;
    const payload = parsePushMessage(data.value);
    if (shouldAppendNotice(payload)) {
      useNoticeStore().addNotice({
        title: payload.type === PUSH_MESSAGE_TYPE.NOTICE ? '通知公告' : '系统消息',
        type: payload.type,
        source: payload.source,
        message: payload.message ?? '',
        content: payload.data?.noticeContent,
        data: payload.data,
        path: payload.path,
        query: payload.query,
        read: false,
        time: new Date(payload.timestamp ?? Date.now()).toLocaleString()
      });
      ElNotification({
        title: payload.type === PUSH_MESSAGE_TYPE.NOTICE ? '通知公告' : '消息',
        message: payload.message ?? '',
        type: 'success',
        duration: 3000
      });
    }
    data.value = null;
  });
};
