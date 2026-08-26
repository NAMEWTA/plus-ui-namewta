import type { SystemAdminService } from '@namewta/domain-system-admin';
import type { RouteLocationRaw } from 'vue-router';
import { computed, shallowRef, type Component, type Ref } from 'vue';

export interface SystemDictOption {
  label: string;
  value: string;
}

export interface SystemAdminWebRuntime {
  service: SystemAdminService;
  treePanel: Component;
  confirm(message: string): Promise<void>;
  success(message: string): void;
  error(message: string): void;
  warning(message: string): void;
  download(url: string, params: unknown, fileName: string): Promise<void> | void;
  dicts(...types: string[]): Record<string, Readonly<Ref<SystemDictOption[]>>>;
  closeCurrentPage(): Promise<void> | void;
  closeAndOpenPage(location: RouteLocationRaw): Promise<void> | void;
  config(key: string): Promise<string | undefined>;
  hasPermission(permission: string): boolean;
  currentUserId(): string | number | undefined;
  uploadHeaders(): Readonly<Record<string, string>>;
}

export function createLiveSystemDictRefs(
  types: readonly string[],
  load: () => Promise<Record<string, SystemDictOption[]>>
): Record<string, Readonly<Ref<SystemDictOption[]>>> {
  const source = shallowRef<Record<string, SystemDictOption[]>>({});
  void load().then(value => {
    source.value = value;
  });
  return Object.fromEntries(types.map(type => [type, computed(() => source.value[type] ?? [])]));
}
