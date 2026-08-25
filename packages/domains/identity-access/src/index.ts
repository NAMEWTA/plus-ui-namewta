import type { DomainModule } from '@namewta/platform-app-runtime';
import type { ClientContext, HttpClient, SessionStore } from '@namewta/platform-contracts';
import { requireClientContext } from '@namewta/platform-contracts';

export interface ApiResponse<T> {
  code?: number;
  data?: T;
  msg?: string;
}

export interface ClientAuthContext {
  clientEnabled: boolean;
  registerEnabled: boolean;
}

export interface LoginVerification {
  captchaEnabled: boolean;
  img?: string;
  uuid?: string;
}

export interface LoginPreparation {
  context: ClientAuthContext;
  verification: LoginVerification;
}

export interface PasswordLoginInput {
  code?: string;
  password: string;
  username: string;
  uuid?: string;
}

export interface IdentitySession {
  accessToken: string;
}

export type IdentityAccessErrorCode =
  | 'client-context-unavailable'
  | 'invalid-credentials'
  | 'invalid-login-response'
  | 'invalid-verification-response';

export class IdentityAccessError extends Error {
  readonly code: IdentityAccessErrorCode;

  constructor(code: IdentityAccessErrorCode, message: string) {
    super(message);
    this.name = 'IdentityAccessError';
    this.code = code;
  }
}

export interface IdentityAccessService {
  readonly client: ClientContext;
  login(input: PasswordLoginInput): Promise<IdentitySession>;
  prepareLogin(): Promise<LoginPreparation>;
}

export interface IdentityAccessServiceOptions {
  client: ClientContext;
  encryptLoginRequest?: boolean;
  http: HttpClient;
  session: SessionStore;
}

export const identityAccessDomainModule: DomainModule = Object.freeze({
  id: 'identity-access',
  backendModules: Object.freeze(['ruoyi-admin', 'ruoyi-system']),
  capabilities: Object.freeze(['client-context', 'password-login', 'isolated-session'])
});

const clientContextError = () =>
  new IdentityAccessError('client-context-unavailable', '客户端认证配置不可用，无法登录');

function parseClientAuthContext(value: unknown): ClientAuthContext {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw clientContextError();
  const context = value as Record<string, unknown>;
  if (typeof context.clientEnabled !== 'boolean' || typeof context.registerEnabled !== 'boolean') {
    throw clientContextError();
  }
  if (!context.clientEnabled) throw clientContextError();
  return Object.freeze({ clientEnabled: true, registerEnabled: context.registerEnabled });
}

function parseVerification(value: unknown): LoginVerification {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new IdentityAccessError('invalid-verification-response', '登录验证码配置不可用');
  }
  const verification = value as Record<string, unknown>;
  if (typeof verification.captchaEnabled !== 'boolean') {
    throw new IdentityAccessError('invalid-verification-response', '登录验证码配置不可用');
  }
  return Object.freeze({
    captchaEnabled: verification.captchaEnabled,
    ...(typeof verification.img === 'string' ? { img: verification.img } : {}),
    ...(typeof verification.uuid === 'string' ? { uuid: verification.uuid } : {})
  });
}

function parseAccessToken(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new IdentityAccessError('invalid-login-response', '登录响应缺少访问令牌');
  }
  const token = (value as Record<string, unknown>).access_token;
  if (typeof token !== 'string' || !token.trim()) {
    throw new IdentityAccessError('invalid-login-response', '登录响应缺少访问令牌');
  }
  return token;
}

function requireCredentials(input: PasswordLoginInput): PasswordLoginInput {
  if (!input.username.trim() || !input.password) {
    throw new IdentityAccessError('invalid-credentials', '请输入用户名和密码');
  }
  return input;
}

export function createClientSessionKey(appId: string, clientId: string): string {
  if (!appId.trim()) throw new Error('App id is required');
  const client = requireClientContext({ clientId });
  return `namewta:${encodeURIComponent(appId.trim())}:${encodeURIComponent(client.clientId)}:access-token`;
}

export function createIdentityAccessService({
  client: clientInput,
  encryptLoginRequest = true,
  http,
  session
}: IdentityAccessServiceOptions): IdentityAccessService {
  const client = Object.freeze(requireClientContext(clientInput));
  let prepared = false;

  return Object.freeze({
    client,
    async prepareLogin() {
      prepared = false;
      const contextResponse = await http.request<ApiResponse<unknown>>({
        url: '/auth/client/context',
        method: 'get',
        headers: { isToken: false }
      });
      const context = parseClientAuthContext(contextResponse.data);
      const verificationResponse = await http.request<ApiResponse<unknown>>({
        url: '/auth/code',
        method: 'get',
        headers: { isToken: false },
        timeout: 20000
      });
      const verification = parseVerification(verificationResponse.data);
      prepared = true;
      return Object.freeze({ context, verification });
    },
    async login(input) {
      if (!prepared) throw clientContextError();
      const credentials = requireCredentials(input);
      const response = await http.request<ApiResponse<unknown>>({
        url: '/auth/login',
        method: 'post',
        headers: { isToken: false, isEncrypt: encryptLoginRequest, repeatSubmit: false },
        data: {
          username: credentials.username,
          password: credentials.password,
          ...(credentials.code ? { code: credentials.code } : {}),
          ...(credentials.uuid ? { uuid: credentials.uuid } : {}),
          clientId: client.clientId,
          grantType: 'password'
        }
      });
      const accessToken = parseAccessToken(response.data);
      session.setToken(accessToken);
      return Object.freeze({ accessToken });
    }
  });
}
