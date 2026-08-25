export type HandledError = Error & { isHandled: true };

export function createHandledError(message: string): HandledError {
  const error = new Error(message) as HandledError;
  error.isHandled = true;
  return error;
}

export function isHandledError(error: unknown): error is HandledError {
  return Boolean((error as { isHandled?: boolean } | undefined)?.isHandled);
}

export function normalizeTransportMessage(message?: string): string | undefined {
  if (!message) return undefined;
  if (message === 'Network Error') return '后端接口连接异常';
  if (message.includes('timeout')) return '系统接口请求超时';
  if (message.includes('Request failed with status code')) return `系统接口${message.slice(-3)}异常`;
  return message;
}

export function payloadErrorMessage(data: unknown, resolveCode: (code: unknown) => string | undefined) {
  if (!data || typeof data !== 'object') return undefined;
  const payload = data as Record<string, unknown>;
  if (typeof payload.msg === 'string') return payload.msg;
  if (typeof payload.message === 'string') return payload.message;
  return resolveCode(payload.code);
}
