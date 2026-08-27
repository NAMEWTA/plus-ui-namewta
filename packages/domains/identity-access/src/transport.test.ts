import { describe, expect, it } from 'vitest';
import { projectClientAuthContextTransport, type ClientAuthContextTransport } from './transport';

describe('identity OpenAPI transport boundary', () => {
  it('keeps domain booleans explicit when optional transport fields are absent', () => {
    const transport: ClientAuthContextTransport = { clientEnabled: true };
    expect(projectClientAuthContextTransport(transport)).toEqual({ clientEnabled: true, registerEnabled: false });
  });
});
