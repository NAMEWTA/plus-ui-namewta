import type { ErrorPresenter, NavigationPort, SessionPort } from '@namewta/platform-contracts';

export interface ReloginState {
  show: boolean;
}

export interface ReloginDependencies {
  navigation: NavigationPort;
  presenter: ErrorPresenter;
  session: SessionPort;
  state: ReloginState;
}

export function requestRelogin({ navigation, presenter, session, state }: ReloginDependencies): void {
  if (state.show) return;
  state.show = true;
  void presenter
    .confirmSessionExpired()
    .then(async () => {
      state.show = false;
      await session.logout();
      await navigation.replaceWithLogin(encodeURIComponent(navigation.currentLocation() || '/'));
    })
    .catch(() => {
      state.show = false;
    });
}
