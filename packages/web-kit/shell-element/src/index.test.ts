import { describe, expect, it, vi } from 'vitest';
import { ClientPagination, ClientRightToolbar, ClientWebShell, createClientBrandNavigation } from './index';

describe('client web shell', () => {
  it('exposes a stable client shell component contract', () => {
    expect(ClientWebShell.name).toBe('ClientWebShell');
    expect(ClientWebShell.props).toMatchObject({
      appName: expect.anything(),
      brandHref: expect.anything(),
      clientLabel: expect.anything()
    });
  });

  it('delegates brand navigation to its App-owned callback and injected href', () => {
    const preventDefault = vi.fn();
    const onSelect = vi.fn();
    const navigation = createClientBrandNavigation('/tenant/client/login', onSelect);

    navigation.onClick({ preventDefault });

    expect(navigation.href).toBe('/tenant/client/login');
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('publishes actionable demo host component contracts', () => {
    expect(ClientRightToolbar.name).toBe('ClientRightToolbar');
    expect(ClientRightToolbar.emits).toEqual(['update:showSearch', 'queryTable']);
    expect(ClientPagination.name).toBe('ClientPagination');
    expect(ClientPagination.emits).toEqual(['update:page', 'update:limit', 'pagination']);
  });
});
