import type { ClientContext } from '@namewta/platform-contracts';

export interface ClientWebConfig {
  apiBaseUrl: string;
  client: ClientContext;
  loginEncryption: boolean;
  responsePrivateKey?: string;
  requestPublicKey?: string;
}

export type ClientWebEnvironment = Readonly<Record<string, string | boolean | undefined>>;

export class ClientWebConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientWebConfigurationError';
  }
}

function requiredText(value: unknown, message: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new ClientWebConfigurationError(message);
  return value.trim();
}

function booleanSetting(value: unknown): boolean {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  throw new ClientWebConfigurationError('VITE_CLIENT_WEB_LOGIN_ENCRYPTION must be true or false');
}

export function readClientWebConfig(environment: ClientWebEnvironment): ClientWebConfig {
  const clientId = requiredText(environment.VITE_CLIENT_WEB_CLIENT_ID, 'Client Web clientId is required');
  const loginEncryption = booleanSetting(environment.VITE_CLIENT_WEB_LOGIN_ENCRYPTION);
  const apiBaseUrl =
    typeof environment.VITE_CLIENT_WEB_API_BASE_URL === 'string' && environment.VITE_CLIENT_WEB_API_BASE_URL.trim()
      ? environment.VITE_CLIENT_WEB_API_BASE_URL.trim()
      : '/prod-api';
  if (!loginEncryption) return Object.freeze({ apiBaseUrl, client: Object.freeze({ clientId }), loginEncryption });

  const requestPublicKey = requiredText(
    environment.VITE_CLIENT_WEB_REQUEST_PUBLIC_KEY,
    'Client Web encryption key material is required'
  );
  const responsePrivateKey = requiredText(
    environment.VITE_CLIENT_WEB_RESPONSE_PRIVATE_KEY,
    'Client Web encryption key material is required'
  );
  return Object.freeze({
    apiBaseUrl,
    client: Object.freeze({ clientId }),
    loginEncryption,
    requestPublicKey,
    responsePrivateKey
  });
}
