export * from './public';
export type {
  ResetPwdForm,
  UserForm,
  UserInfo,
  UserInfoVO,
  UserProfileForm,
  UserProfileInfoVO,
  UserQuery,
  UserVO
} from './types';

export const systemUserResource = Object.freeze({ controller: 'SysUserController', basePath: '/system/user' });
