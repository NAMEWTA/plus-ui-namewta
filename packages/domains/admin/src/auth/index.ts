export type {
  ClientAuthContext,
  IdentityAccessManagementService,
  IdentityAccessServiceOptions,
  IdentityInfo,
  IdentityMenu,
  IdentitySession,
  PasswordLoginInput,
  RegistrationInput,
  SocialCallbackInput,
  SocialCallbackResult
} from './types';
export { createClientSessionKey, createIdentityAccessService, IdentityAccessError } from '../index';

export const adminAuthResource = Object.freeze({ controller: 'AuthController', basePath: '/auth' });
