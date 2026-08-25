import { describe, expect, it } from 'vitest';
import { readClientWebConfig } from './config';

describe('client web config', () => {
  it('normalizes an explicit proof configuration', () => {
    expect(
      readClientWebConfig({
        VITE_CLIENT_WEB_API_BASE_URL: ' /prod-api ',
        VITE_CLIENT_WEB_CLIENT_ID: ' client-proof ',
        VITE_CLIENT_WEB_LOGIN_ENCRYPTION: 'false'
      })
    ).toEqual({
      apiBaseUrl: '/prod-api',
      client: { clientId: 'client-proof' },
      loginEncryption: false
    });
  });

  it.each([
    {},
    { VITE_CLIENT_WEB_CLIENT_ID: '' },
    { VITE_CLIENT_WEB_CLIENT_ID: 'client', VITE_CLIENT_WEB_LOGIN_ENCRYPTION: 'yes' }
  ])('rejects invalid configuration before application transport setup: %j', env => {
    expect(() => readClientWebConfig(env)).toThrow();
  });

  it('requires key material when request encryption is enabled', () => {
    expect(() =>
      readClientWebConfig({
        VITE_CLIENT_WEB_CLIENT_ID: 'client-proof',
        VITE_CLIENT_WEB_LOGIN_ENCRYPTION: 'true'
      })
    ).toThrow('Client Web encryption key material is required');
  });
});
