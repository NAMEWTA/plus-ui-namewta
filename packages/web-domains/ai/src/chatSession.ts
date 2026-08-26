import type { AiWebRuntime } from './runtime';
import { requireAiWebRuntime } from './runtime';

export interface AiChatSnapshot {
  error: string;
  frameUrl: string;
  loading: boolean;
}

export interface AiChatSession {
  dispose(): void;
  frameFailed(sourceUrl?: string): void;
  frameLoaded(sourceUrl?: string): void;
  load(): Promise<void>;
  snapshot(): AiChatSnapshot;
}

const missingCredentialMessage = '登录凭证不存在，请重新登录后再试';
const missingBaseUrlMessage = 'AI 服务地址不存在，请联系管理员';
const missingIdentityMessage = '获取 AI 用户身份失败';
const registrationFailureMessage = '加载 AI 聊天失败，请稍后重试';
const frameFailureMessage = 'AI 聊天连接中断，请重新加载';

function createFrameUrl(baseUrl: string, openId: string, credential: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const params = new URLSearchParams({ openId, trustedCredential: credential });
  return `${normalizedBase}/snail-chat/?${params.toString()}`;
}

export function createAiChatSession(
  runtimeInput: AiWebRuntime | undefined,
  onChange: (snapshot: AiChatSnapshot) => void
): AiChatSession {
  const runtime = requireAiWebRuntime(runtimeInput);
  let attempt = 0;
  let disposed = false;
  let state: AiChatSnapshot = { error: '', frameUrl: '', loading: false };

  const snapshot = (): AiChatSnapshot => ({ ...state });
  const publish = () => onChange(snapshot());
  const replaceState = (next: AiChatSnapshot) => {
    state = next;
    publish();
  };
  const matchesFrame = (sourceUrl?: string) => !sourceUrl || sourceUrl === state.frameUrl;

  return Object.freeze({
    async load() {
      const currentAttempt = ++attempt;
      replaceState({ error: '', frameUrl: '', loading: true });
      const baseUrl = runtime.baseUrl();
      if (typeof baseUrl !== 'string' || baseUrl.trim() === '') {
        replaceState({ error: missingBaseUrlMessage, frameUrl: '', loading: false });
        return;
      }
      const credential = runtime.trustedCredential();
      if (typeof credential !== 'string' || credential.trim() === '') {
        replaceState({ error: missingCredentialMessage, frameUrl: '', loading: false });
        return;
      }

      try {
        const response = await runtime.service.registerCurrentSnailUser();
        if (disposed || currentAttempt !== attempt) return;
        const openId = response.data?.openId;
        if (typeof openId !== 'string' || openId.trim() === '') {
          replaceState({ error: missingIdentityMessage, frameUrl: '', loading: false });
          return;
        }
        replaceState({ error: '', frameUrl: createFrameUrl(baseUrl, openId, credential), loading: true });
      } catch {
        if (disposed || currentAttempt !== attempt) return;
        replaceState({ error: registrationFailureMessage, frameUrl: '', loading: false });
      }
    },
    frameLoaded(sourceUrl) {
      if (disposed || !state.frameUrl || !matchesFrame(sourceUrl)) return;
      replaceState({ ...state, loading: false });
    },
    frameFailed(sourceUrl) {
      if (disposed || !state.frameUrl || !matchesFrame(sourceUrl)) return;
      ++attempt;
      replaceState({ error: frameFailureMessage, frameUrl: '', loading: false });
    },
    dispose() {
      disposed = true;
      ++attempt;
      state = { error: '', frameUrl: '', loading: false };
    },
    snapshot
  });
}
