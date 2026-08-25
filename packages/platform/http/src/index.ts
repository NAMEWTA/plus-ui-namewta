import type { ErrorKind } from '@namewta/platform-contracts';

export type TransportErrorKind = ErrorKind | 'encryption' | 'unauthorized';
export type TransportErrorCode = number | string;

export interface TransportErrorOptions {
  cause?: unknown;
  code?: TransportErrorCode;
  handled?: boolean;
  kind: TransportErrorKind;
  message: string;
}

export class TransportError extends Error {
  readonly code?: TransportErrorCode;
  readonly isHandled: boolean;
  readonly kind: TransportErrorKind;

  constructor({ cause, code, handled = false, kind, message }: TransportErrorOptions) {
    super(message, { cause });
    this.name = 'TransportError';
    this.code = code;
    this.isHandled = handled;
    this.kind = kind;
  }
}

export type HandledError = TransportError & { isHandled: true };

export function createTransportError(options: TransportErrorOptions): TransportError {
  return new TransportError(options);
}

export function createHandledError(message: string): HandledError {
  return createTransportError({ kind: 'business', message, handled: true }) as HandledError;
}

export function isHandledError(error: unknown): error is HandledError {
  return Boolean((error as { isHandled?: boolean } | undefined)?.isHandled);
}

export function isTransportError(error: unknown): error is TransportError {
  return error instanceof TransportError;
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
