import { describe, expect, it } from 'vitest';
import { clientThemeTokens } from './index';

describe('design tokens', () => {
  it('publishes a frozen semantic client theme contract', () => {
    expect(clientThemeTokens).toMatchObject({ accent: '#087f5b', surface: '#ffffff', text: '#172b24' });
    expect(Object.isFrozen(clientThemeTokens)).toBe(true);
  });
});
