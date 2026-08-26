import type { ExternalOperationTarget, NavigationIntent, OperationsService } from '@namewta/domain-operations';
import { computed, shallowRef, type Component, type Ref } from 'vue';

export interface OperationsDictOption {
  label: string;
  value: string;
  elTagType?: string;
  elTagClass?: string;
}
export interface OperationsWebRuntime {
  service: OperationsService;
  iframe: Component;
  externalUrls: Readonly<Record<ExternalOperationTarget, string | undefined>>;
  confirm(message: string): Promise<void>;
  success(message: string): void;
  error(message: string): void;
  loading(message: string): unknown;
  closeLoading(handle: unknown): void;
  download(url: string, params: unknown, fileName: string): Promise<void> | void;
  openDownload(intent: NavigationIntent): Promise<void> | void;
  dicts(...types: string[]): Record<string, Readonly<Ref<OperationsDictOption[]>>>;
  hasPermission(permission: string): boolean;
}

export function createLiveOperationsDictRefs(
  types: readonly string[],
  load: () => Promise<Record<string, OperationsDictOption[]>>
) {
  const source = shallowRef<Record<string, OperationsDictOption[]>>({});
  void load().then(value => {
    source.value = value;
  });
  return Object.fromEntries(types.map(type => [type, computed(() => source.value[type] ?? [])]));
}
