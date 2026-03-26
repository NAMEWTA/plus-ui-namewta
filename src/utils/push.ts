import { getToken } from '@/utils/auth';
import { ElNotification } from 'element-plus';
import { useNoticeStore } from '@/store/modules/notice';
import { parsePushMessage, resolveNoticeGroup, resolveNoticeTitle, shouldAppendNotice } from '@/utils/push-message';

let closePushConnection: (() => void) | undefined;

const appendNotice = (raw: string) => {
  const payload = parsePushMessage(raw);
  if (!shouldAppendNotice(payload)) {
    return;
  }
  const title = resolveNoticeTitle(payload);
  useNoticeStore().addNotice({
    title,
    category: resolveNoticeGroup(payload),
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
    title,
    message: payload.message ?? '',
    type: 'success',
    duration: 3000
  });
};

const buildSseUrl = (path: string) => {
  return `${import.meta.env.VITE_APP_BASE_API}${path}?Authorization=Bearer ${getToken()}&clientid=${import.meta.env.VITE_APP_CLIENT_ID}`;
};

const buildWsUrl = (path: string) => {
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  return `${protocol}${window.location.host}${buildSseUrl(path)}`;
};

const initSsePush = (url: string) => {
  const { data, error, close } = useEventSource(url, [], {
    autoReconnect: {
      retries: 5,
      delay: 5000,
      onFailed() {
        console.log('Failed to connect after 5 retries');
      }
    }
  });
  closePushConnection = close;

  watch(error, () => {
    console.log('SSE connection error:', error.value);
    error.value = null;
  });

  watch(data, () => {
    if (!data.value) return;
    appendNotice(data.value);
    data.value = null;
  });
};

const initWsPush = (url: string) => {
  const { close } = useWebSocket(url, {
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        console.log('websocket重连失败');
      }
    },
    heartbeat: {
      message: 'ping',
      interval: 10000,
      pongTimeout: 2000
    },
    onConnected() {
      console.log('websocket已经连接');
    },
    onDisconnected() {
      console.log('websocket已经断开');
    },
    onMessage: (_, e) => {
      if (String(e.data) === 'pong') {
        return;
      }
      appendNotice(String(e.data));
    }
  });
  closePushConnection = close;
};

export const initPush = () => {
  closePush();
  if (import.meta.env.VITE_APP_MESSAGE_ENABLED === 'false') {
    return;
  }
  const path = import.meta.env.VITE_APP_MESSAGE_PATH || '/resource/message';
  const transport = import.meta.env.VITE_APP_MESSAGE_TRANSPORT || 'sse';
  if (transport.toLowerCase() === 'websocket') {
    initWsPush(buildWsUrl(path));
    return;
  }
  initSsePush(buildSseUrl(path));
};

export const closePush = () => {
  closePushConnection?.();
  closePushConnection = undefined;
};
