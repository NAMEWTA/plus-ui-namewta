export const PUSH_MESSAGE_TYPE = {
  MESSAGE: 'message',
  NOTICE: 'notice',
  LLM: 'llm',
  CUSTOM: 'custom'
} as const;

export interface PushMessagePayload {
  type?: string;
  source?: string;
  message?: string;
  data?: Record<string, any> | null;
  path?: string;
  query?: Record<string, any> | null;
  timestamp?: number;
}

const MESSAGE_CENTER_TYPES = new Set<string>([PUSH_MESSAGE_TYPE.MESSAGE, PUSH_MESSAGE_TYPE.NOTICE]);

export const parsePushMessage = (raw: string): PushMessagePayload => {
  try {
    const payload = JSON.parse(raw) as PushMessagePayload;
    return {
      type: payload.type ?? PUSH_MESSAGE_TYPE.MESSAGE,
      source: payload.source ?? 'backend',
      message: payload.message ?? '',
      data: payload.data ?? null,
      path: payload.path,
      query: payload.query ?? null,
      timestamp: payload.timestamp ?? Date.now()
    };
  } catch {
    return {
      type: PUSH_MESSAGE_TYPE.MESSAGE,
      source: 'backend',
      message: raw,
      data: null,
      path: undefined,
      query: null,
      timestamp: Date.now()
    };
  }
};

export const shouldAppendNotice = (payload: PushMessagePayload) => {
  return MESSAGE_CENTER_TYPES.has(payload.type ?? PUSH_MESSAGE_TYPE.MESSAGE);
};
