/**
 * 注册
 */
export type RegisterForm = {
  username: string;
  password: string;
  confirmPassword?: string;
  code?: string;
  uuid?: string;
};

/**
 * 公开客户端认证上下文
 */
export interface ClientAuthContext {
  /**
   * 当前 Client 是否可用
   */
  clientEnabled: boolean;
  /**
   * 当前 Client 是否开放注册
   */
  registerEnabled: boolean;
}

/**
 * 登录请求
 */
export interface LoginData {
  username?: string;
  password?: string;
  rememberMe?: boolean;
  socialCode?: string;
  socialState?: string;
  source?: string;
  code?: string;
  uuid?: string;
  clientId: string;
  grantType: string;
}

/**
 * 登录响应
 */
export interface LoginResult {
  access_token: string;
}

/**
 * 验证码返回
 */
export interface VerifyCodeResult {
  captchaEnabled: boolean;
  uuid?: string;
  img?: string;
}

/**
 * 分页返回结果
 */
export interface PageResult<T = any> {
  total: number;
  rows: T[];
}
