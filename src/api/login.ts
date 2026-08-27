import {
  createIdentityAccessService,
  type RegistrationInput,
  type SocialCallbackInput
} from '@namewta/domain-identity-access';
import type { UserInfo } from '@/api/system/user/types';
import type { AxiosPromise, RuoYiAjaxResult } from '@/utils/api-types';
import { getToken, removeToken, setToken } from '@/utils/auth';
import { closePush } from '@/utils/push';
import request from '@/utils/request';
import type { ClientAuthContext, LoginData, LoginResult, RegisterForm, VerifyCodeResult } from './types';

const http = {
  request: <T>(config: Parameters<typeof request>[0]) => request(config) as Promise<T>
};
const session = { clear: removeToken, getToken, setToken };

export const identityAccessService = createIdentityAccessService({
  client: { clientId: import.meta.env.VITE_APP_CLIENT_ID },
  http,
  session
});

const result = <T>(data: T, msg = '操作成功'): RuoYiAjaxResult<T> => ({ code: 200, data, msg });

export async function login(data: LoginData): AxiosPromise<LoginResult> {
  const identitySession =
    data.grantType === 'social'
      ? await identityAccessService.socialLogin(data as SocialCallbackInput)
      : await identityAccessService.login({
          username: data.username ?? '',
          password: data.password ?? '',
          code: data.code,
          uuid: data.uuid
        });
  return result({ access_token: identitySession.accessToken }) as never;
}

export async function register(data: RegisterForm): Promise<RuoYiAjaxResult<null>> {
  await identityAccessService.register(data as RegistrationInput);
  return result(null);
}

export async function getClientAuthContext(): AxiosPromise<ClientAuthContext> {
  return result(await identityAccessService.getClientContext()) as never;
}

export async function logout(): Promise<RuoYiAjaxResult<null>> {
  closePush();
  if (
    import.meta.env.VITE_APP_MESSAGE_ENABLED === 'true' &&
    import.meta.env.VITE_APP_MESSAGE_TRANSPORT.toLowerCase() === 'sse'
  ) {
    void request({ url: import.meta.env.VITE_APP_MESSAGE_PATH + '/close', method: 'get' }).catch(() => undefined);
  }
  await identityAccessService.logout();
  return result(null);
}

export async function getCodeImg(): AxiosPromise<VerifyCodeResult> {
  return result(await identityAccessService.getVerification()) as never;
}

export async function callback(data: LoginData): AxiosPromise<LoginResult | null> {
  const callbackResult = await identityAccessService.socialCallback(data as SocialCallbackInput);
  return result(
    callbackResult.accessToken ? { access_token: callbackResult.accessToken } : null,
    callbackResult.message
  );
}

export async function getInfo(): AxiosPromise<UserInfo> {
  return result((await identityAccessService.getInfo()) as UserInfo) as never;
}
