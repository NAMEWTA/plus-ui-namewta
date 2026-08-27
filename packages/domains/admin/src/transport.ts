import type { OpenApiSchema } from '@namewta/api-contracts';
import type { ClientAuthContext } from './index';

export type ClientAuthContextTransport = OpenApiSchema<'AuthClientContextVo'>;

export function projectClientAuthContextTransport(value: ClientAuthContextTransport): ClientAuthContext {
  return {
    clientEnabled: value.clientEnabled === true,
    registerEnabled: value.registerEnabled === true
  };
}
