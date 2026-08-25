import { describe, expect, it, vi } from 'vitest';
import { requestRelogin } from './index';

describe('requestRelogin', () => {
  it('keeps one pending prompt and redirects after logout', async () => {
    let confirm = () => undefined;
    const prompt = new Promise<void>(resolve => (confirm = resolve));
    const presenter = { confirmSessionExpired: vi.fn(() => prompt), present: vi.fn() };
    const session = { logout: vi.fn().mockResolvedValue(undefined) };
    const navigation = { currentLocation: () => '/system/user?tab=roles', replaceWithLogin: vi.fn() };
    const state = { show: false };
    requestRelogin({ navigation, presenter, session, state });
    requestRelogin({ navigation, presenter, session, state });
    expect(presenter.confirmSessionExpired).toHaveBeenCalledOnce();
    confirm();
    await vi.waitFor(() => expect(navigation.replaceWithLogin).toHaveBeenCalledWith('%2Fsystem%2Fuser%3Ftab%3Droles'));
    expect(session.logout).toHaveBeenCalledOnce();
    expect(state.show).toBe(false);
  });
});
