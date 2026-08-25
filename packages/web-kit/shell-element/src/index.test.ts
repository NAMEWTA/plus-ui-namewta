import { describe, expect, it } from 'vitest';
import { ClientWebShell } from './index';

describe('client web shell', () => {
  it('exposes a stable client shell component contract', () => {
    expect(ClientWebShell.name).toBe('ClientWebShell');
    expect(ClientWebShell.props).toMatchObject({ appName: expect.anything(), clientLabel: expect.anything() });
  });
});
