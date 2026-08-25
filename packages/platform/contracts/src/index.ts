export interface ClientContext {
  clientId: string;
}

export interface StoragePort<T> {
  get(): T | null;
  remove(): void;
  set(value: T): void;
}

export type TokenStorage = StoragePort<string>;

export interface SessionStore {
  clear(): void;
  getToken(): string | null;
  setToken(token: string): void;
}

export type HttpMethod = 'delete' | 'get' | 'patch' | 'post' | 'put';

export interface HttpRequest {
  data?: unknown;
  headers?: Readonly<Record<string, unknown>>;
  method: HttpMethod;
  params?: unknown;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  url: string;
}

export interface HttpClient {
  request<T>(request: HttpRequest): Promise<T>;
}

export interface EncryptedRequest {
  data: string;
  encryptedKey: string;
}

export interface CryptoPort {
  decryptResponse(data: string, encryptedKey: string): unknown;
  encryptRequest(data: string): EncryptedRequest;
}

export type ErrorKind = 'business' | 'network' | 'server' | 'warning';

export interface PresentedError {
  kind: ErrorKind;
  message: string;
}

export interface ErrorPresenter {
  confirmSessionExpired(): Promise<void>;
  present(error: PresentedError): void;
}

export interface NavigationPort {
  currentLocation(): string;
  replaceWithLogin(redirect: string): Promise<void> | void;
}

export interface SessionPort {
  logout(): Promise<void>;
}

export function requireClientContext(context: ClientContext): ClientContext {
  if (typeof context.clientId !== 'string' || context.clientId.trim() === '') {
    throw new Error('ClientContext.clientId is required');
  }
  return { clientId: context.clientId.trim() };
}
