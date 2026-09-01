import type { ApiResponse, PersonMatchResult, StatusProbe } from './types';

function unavailable(): never {
  throw new Error('Profile 响应不可用');
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return unavailable();
  return value as Record<string, unknown>;
}

function strictRecord(value: unknown, keys: readonly string[]): Record<string, unknown> {
  const source = record(value);
  if (Object.keys(source).some(key => !keys.includes(key))) return unavailable();
  return source;
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) return unavailable();
  return value;
}

function response<T>(value: unknown, project: (data: unknown) => T): ApiResponse<T> {
  const source = record(value);
  if (source.code !== undefined && !Number.isInteger(source.code)) return unavailable();
  if (source.msg !== undefined && source.msg !== null && typeof source.msg !== 'string') return unavailable();
  const result: ApiResponse<T> = { data: project(source.data) };
  if (typeof source.code === 'number') result.code = source.code;
  if (typeof source.msg === 'string') result.msg = source.msg;
  return Object.freeze(result);
}

export function projectStatusProbe(value: unknown): StatusProbe {
  const source = strictRecord(value, ['status']);
  return Object.freeze({ status: requiredString(source.status) });
}

export function projectPersonMatch(value: unknown): PersonMatchResult {
  const source = strictRecord(value, ['maskedPhone', 'status']);
  if (source.maskedPhone !== null && typeof source.maskedPhone !== 'string') return unavailable();
  return Object.freeze({
    status: requiredString(source.status),
    maskedPhone: source.maskedPhone as string | null
  });
}

export const projectStatusProbeResponse = (value: unknown): ApiResponse<StatusProbe> =>
  response(value, projectStatusProbe);

export const projectPersonMatchResponse = (value: unknown): ApiResponse<PersonMatchResult> =>
  response(value, projectPersonMatch);
