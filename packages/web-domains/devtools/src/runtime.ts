import type { DevtoolsService } from '@namewta/domain-devtools';
import type { RouteLocationRaw } from 'vue-router';

export interface DevtoolsWebRuntime {
  service: DevtoolsService;
  clientId(): string | number | undefined;
  confirm(message: string): Promise<void>;
  success(message: string): void;
  error(message: string): void;
  navigate(location: RouteLocationRaw): Promise<void> | void;
  closeAndOpenPage(location: RouteLocationRaw): Promise<void> | void;
  downloadZip(url: string, fileName: string): Promise<void> | void;
}
