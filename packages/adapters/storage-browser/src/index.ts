import type { SessionStore, TokenStorage } from '@namewta/platform-contracts';

export interface BrowserStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export interface BrowserTokenStorageOptions {
  key: string;
  storage?: BrowserStorage;
}

export function createBrowserTokenStorage({ key, storage }: BrowserTokenStorageOptions): TokenStorage {
  if (!key) throw new Error('Token storage key is required');
  let fallbackValue: string | null = null;
  const target = () => {
    if (storage) return storage;
    try {
      return globalThis.localStorage;
    } catch {
      return undefined;
    }
  };
  return {
    get: () => target()?.getItem(key) ?? fallbackValue,
    remove: () => {
      target()?.removeItem(key);
      fallbackValue = null;
    },
    set: value => {
      const current = target();
      if (current) current.setItem(key, value);
      else fallbackValue = value;
    }
  };
}

export function createBrowserSessionStore(options: BrowserTokenStorageOptions): SessionStore {
  const tokens = createBrowserTokenStorage(options);
  return {
    clear: tokens.remove,
    getToken: tokens.get,
    setToken: tokens.set
  };
}
