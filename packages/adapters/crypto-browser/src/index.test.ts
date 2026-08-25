import { beforeEach, describe, expect, it, vi } from 'vitest';

const rsa = vi.hoisted(() => ({ decrypt: vi.fn(), encrypt: vi.fn(), setPrivateKey: vi.fn(), setPublicKey: vi.fn() }));
vi.mock('jsencrypt', () => ({
  JSEncrypt: class {
    decrypt = rsa.decrypt;
    encrypt = rsa.encrypt;
    setPrivateKey = rsa.setPrivateKey;
    setPublicKey = rsa.setPublicKey;
  }
}));

import { createBrowserCryptoAdapter } from './index';

describe('browser crypto adapter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fails closed when either independently injected key material is missing', () => {
    expect(() => createBrowserCryptoAdapter({ publicKey: '', privateKey: 'response-key' })).toThrow(
      'Request public key is required'
    );
    expect(() => createBrowserCryptoAdapter({ publicKey: 'request-key', privateKey: '' })).toThrow(
      'Response private key is required'
    );
  });

  it('wraps a generated request key with the injected request public key', () => {
    rsa.encrypt.mockReturnValue('wrapped-key');
    const adapter = createBrowserCryptoAdapter({
      publicKey: 'request-key',
      privateKey: 'response-key',
      randomValues: bytes => bytes.fill(1)
    });
    const result = adapter.encryptRequest('{"value":1}');
    expect(rsa.setPublicKey).toHaveBeenCalledWith('request-key');
    expect(result.encryptedKey).toBe('wrapped-key');
    expect(result.data).not.toContain('"value"');
  });
});
