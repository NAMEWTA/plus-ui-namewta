import type { DomainModule } from '@namewta/platform-app-runtime';
import type { ClientContext, HttpClient, SessionStore } from '@namewta/platform-contracts';
import { requireClientContext } from '@namewta/platform-contracts';
import { projectClientAuthContextTransport, type ClientAuthContextTransport } from './transport';

export * from './transport';

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

export interface RegistrationInput extends PasswordLoginInput {
  confirmPassword?: string;
}

export interface SocialCallbackInput {
  code?: string;
  socialCode?: string;
  socialState?: string;
  source?: string;
  state?: string;
}

export interface SocialCallbackResult {
  accessToken?: string;
  message?: string;
}

export interface IdentityInfo {
  permissions: readonly string[];
  roles: readonly string[];
  user: unknown;
}

export type IdentityMenu = Readonly<Record<string, unknown>>;

export type IdentityAccessErrorCode =
  | 'client-context-unavailable'
  | 'invalid-credentials'
  | 'invalid-login-response'
  | 'invalid-identity-response'
  | 'invalid-menu-response'
  | 'registration-disabled'
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

export interface IdentityAccessManagementService extends IdentityAccessService {
  getClientContext(): Promise<ClientAuthContext>;
  getInfo(): Promise<IdentityInfo>;
  getMenus(): Promise<readonly IdentityMenu[]>;
  getVerification(): Promise<LoginVerification>;
  logout(): Promise<void>;
  register(input: RegistrationInput): Promise<void>;
  socialCallback(input: SocialCallbackInput): Promise<SocialCallbackResult>;
  socialLogin(input: SocialCallbackInput): Promise<IdentitySession>;
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
  capabilities: Object.freeze([
    'client-context',
    'password-login',
    'registration',
    'oauth-callback',
    'identity-info',
    'server-menu',
    'isolated-session'
  ])
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
  return Object.freeze(projectClientAuthContextTransport(context as ClientAuthContextTransport));
}

function parseVerification(value: unknown): LoginVerification {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new IdentityAccessError('invalid-verification-response', '登录验证码配置不可用');
  }
  const verification = value as Record<string, unknown>;
  if (typeof verification.captchaEnabled !== 'boolean') {
    throw new IdentityAccessError('invalid-verification-response', '登录验证码配置不可用');
  }
  if (!verification.captchaEnabled) return Object.freeze({ captchaEnabled: false });
  const img = typeof verification.img === 'string' ? verification.img.trim() : '';
  const uuid = typeof verification.uuid === 'string' ? verification.uuid.trim() : '';
  if (!img || !uuid) {
    throw new IdentityAccessError('invalid-verification-response', '登录验证码配置不可用');
  }
  return Object.freeze({ captchaEnabled: true, img, uuid });
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

function parseStringList(value: unknown): readonly string[] {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item.trim())) return Object.freeze([]);
  return Object.freeze(value.map(item => item.trim()));
}

function parseIdentityInfo(value: unknown): IdentityInfo {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new IdentityAccessError('invalid-identity-response', '用户身份响应格式无效');
  }
  const info = value as Record<string, unknown>;
  if (!info.user || typeof info.user !== 'object' || Array.isArray(info.user)) {
    throw new IdentityAccessError('invalid-identity-response', '用户身份响应缺少用户信息');
  }
  return Object.freeze({
    user: info.user,
    roles: parseStringList(info.roles),
    permissions: parseStringList(info.permissions)
  });
}

function parseMenus(value: unknown): readonly IdentityMenu[] {
  if (!Array.isArray(value) || value.some(item => !item || typeof item !== 'object' || Array.isArray(item))) {
    throw new IdentityAccessError('invalid-menu-response', '服务端菜单响应格式无效');
  }
  return Object.freeze(value.map(item => Object.freeze({ ...(item as Record<string, unknown>) })));
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
}: IdentityAccessServiceOptions): IdentityAccessManagementService {
  const client = Object.freeze(requireClientContext(clientInput));
  let prepared = false;
  let context: ClientAuthContext | undefined;

  const loadClientContext = async () => {
    prepared = false;
    context = undefined;
    const contextResponse = await http.request<ApiResponse<ClientAuthContextTransport>>({
      url: '/auth/client/context',
      method: 'get',
      headers: { isToken: false }
    });
    context = parseClientAuthContext(contextResponse.data);
    return context;
  };

  const ensureClientContext = async () => context ?? loadClientContext();

  const loadVerification = async () => {
    prepared = false;
    if (!context) throw clientContextError();
    const verificationResponse = await http.request<ApiResponse<unknown>>({
      url: '/auth/code',
      method: 'get',
      headers: { isToken: false },
      timeout: 20000
    });
    const verification = parseVerification(verificationResponse.data);
    prepared = true;
    return verification;
  };

  return Object.freeze({
    client,
    getClientContext: loadClientContext,
    getVerification: loadVerification,
    async prepareLogin() {
      prepared = false;
      const loadedContext = await loadClientContext();
      const verification = await loadVerification();
      return Object.freeze({ context: loadedContext, verification });
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
    },
    async register(input) {
      if (!prepared || !context) throw clientContextError();
      if (!context.registerEnabled) {
        throw new IdentityAccessError('registration-disabled', '当前客户端未开放注册');
      }
      const credentials = requireCredentials(input);
      if (input.confirmPassword !== undefined && input.confirmPassword !== input.password) {
        throw new IdentityAccessError('invalid-credentials', '两次输入的密码不一致');
      }
      await http.request<ApiResponse<unknown>>({
        url: '/auth/register',
        method: 'post',
        headers: { isToken: false, isEncrypt: encryptLoginRequest, repeatSubmit: false },
        data: {
          username: credentials.username,
          password: credentials.password,
          ...(credentials.code ? { code: credentials.code } : {}),
          ...(credentials.uuid ? { uuid: credentials.uuid } : {}),
          clientId: client.clientId
        }
      });
    },
    async getInfo() {
      const response = await http.request<ApiResponse<unknown>>({ url: '/system/user/getInfo', method: 'get' });
      return parseIdentityInfo(response.data);
    },
    async getMenus() {
      const response = await http.request<ApiResponse<unknown>>({ url: '/system/menu/getRouters', method: 'get' });
      return parseMenus(response.data);
    },
    async socialCallback(input) {
      await ensureClientContext();
      const response = await http.request<ApiResponse<unknown>>({
        url: '/auth/social/callback',
        method: 'post',
        data: { ...input, clientId: client.clientId, grantType: 'social' }
      });
      let accessToken: string | undefined;
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        const candidate = (response.data as Record<string, unknown>).access_token;
        if (typeof candidate === 'string' && candidate.trim()) {
          accessToken = candidate;
          session.setToken(accessToken);
        }
      }
      return Object.freeze({
        ...(accessToken ? { accessToken } : {}),
        ...(response.msg ? { message: response.msg } : {})
      });
    },
    async socialLogin(input) {
      await ensureClientContext();
      const response = await http.request<ApiResponse<unknown>>({
        url: '/auth/login',
        method: 'post',
        headers: { isToken: false, isEncrypt: encryptLoginRequest, repeatSubmit: false },
        data: { ...input, clientId: client.clientId, grantType: 'social' }
      });
      const accessToken = parseAccessToken(response.data);
      session.setToken(accessToken);
      return Object.freeze({ accessToken });
    },
    async logout() {
      await http.request<ApiResponse<unknown>>({ url: '/auth/logout', method: 'post' });
      session.clear();
      prepared = false;
      context = undefined;
    }
  });
}
