import type { UserInfo } from '@/api/system/user/types';
import type { AxiosPromise } from '@/utils/api-types';
import { closePush } from '@/utils/push';
import request from '@/utils/request';
import type { ClientAuthContext, LoginData, LoginResult, RegisterForm, VerifyCodeResult } from './types';

// pc端固定客户端授权id
const clientId = import.meta.env.VITE_APP_CLIENT_ID;

const isEnabledFlag = (value: unknown, defaultValue = false): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === '0' || value === 0) {
    return true;
  }
  if (value === '1' || value === 1) {
    return false;
  }
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return Boolean(value);
};

/**
 * @param data {LoginData}
 * @returns
 */
export function login(data: LoginData): AxiosPromise<LoginResult> {
  const params = {
    ...data,
    clientId: data.clientId || clientId,
    grantType: data.grantType || 'password'
  };
  return request({
    url: '/auth/login',
    headers: {
      isToken: false,
      isEncrypt: true,
      repeatSubmit: false
    },
    method: 'post',
    data: params
  });
}

// 注册方法
export function register(data: RegisterForm) {
  const params = {
    username: data.username,
    password: data.password,
    code: data.code,
    uuid: data.uuid,
    clientId: clientId,
    grantType: 'password'
  };
  return request({
    url: '/auth/register',
    headers: {
      isToken: false,
      isEncrypt: true,
      repeatSubmit: false
    },
    method: 'post',
    data: params
  });
}

/**
 * 查询当前 Client 的公开认证上下文（登录/注册页初始化）
 */
export function getClientAuthContext(): AxiosPromise<ClientAuthContext> {
  return request({
    url: '/auth/client/context',
    headers: {
      isToken: false
    },
    method: 'get'
  }).then((res: any) => {
    const data = res?.data ?? {};
    res.data = {
      clientEnabled: isEnabledFlag(data.clientEnabled, true),
      registerEnabled: isEnabledFlag(data.registerEnabled, false)
    } satisfies ClientAuthContext;
    return res;
  });
}

/**
 * 注销
 */
export function logout() {
  closePush();
  if (
    import.meta.env.VITE_APP_MESSAGE_ENABLED === 'true' &&
    import.meta.env.VITE_APP_MESSAGE_TRANSPORT.toLowerCase() === 'sse'
  ) {
    request({
      url: import.meta.env.VITE_APP_MESSAGE_PATH + '/close',
      method: 'get'
    });
  }
  return request({
    url: '/auth/logout',
    method: 'post'
  });
}

/**
 * 获取验证码
 */
export function getCodeImg(): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/auth/code',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  });
}

/**
 * 第三方登录
 */
export function callback(data: LoginData): AxiosPromise<any> {
  const LoginData = {
    ...data,
    clientId: clientId,
    grantType: 'social'
  };
  return request({
    url: '/auth/social/callback',
    method: 'post',
    data: LoginData
  });
}

// 获取用户详细信息
export function getInfo(): AxiosPromise<UserInfo> {
  return request({
    url: '/system/user/getInfo',
    method: 'get'
  });
}
