export interface DomainModule {
  backendModules: readonly string[];
  capabilities: readonly string[];
  id: string;
}

export type WebViewLoader<View = unknown> = () => Promise<View>;

export interface WebComponentRegistration<View = unknown> {
  componentName: string;
  load: WebViewLoader<View>;
}

export interface WebDomainManifest<View = unknown> {
  components: Readonly<Record<string, WebComponentRegistration<View>>>;
  domainId: string;
  id: string;
}

export type AppRuntimeErrorCode =
  | 'duplicate-component-key'
  | 'duplicate-domain-module'
  | 'duplicate-web-domain-manifest'
  | 'missing-component-key'
  | 'missing-domain-module'
  | 'missing-web-domain-manifest'
  | 'unselected-domain';

export interface AppRuntimeErrorOptions {
  appId: string;
  code: AppRuntimeErrorCode;
  componentKey: string;
  conflictingDomainId?: string;
  conflictingManifestId?: string;
  domainId: string;
  manifestId?: string;
}

export class AppRuntimeError extends Error {
  readonly appId: string;
  readonly code: AppRuntimeErrorCode;
  readonly componentKey: string;
  readonly conflictingDomainId?: string;
  readonly conflictingManifestId?: string;
  readonly domainId: string;
  readonly manifestId?: string;

  constructor(options: AppRuntimeErrorOptions) {
    const details = [
      `app=${options.appId}`,
      `domain=${options.domainId}`,
      `key=${options.componentKey}`,
      options.manifestId && `manifest=${options.manifestId}`,
      options.conflictingDomainId && `conflictingDomain=${options.conflictingDomainId}`,
      options.conflictingManifestId && `conflictingManifest=${options.conflictingManifestId}`
    ].filter(Boolean);
    super(`[${options.code}] ${details.join(' ')}`);
    this.name = 'AppRuntimeError';
    this.appId = options.appId;
    this.code = options.code;
    this.componentKey = options.componentKey;
    this.conflictingDomainId = options.conflictingDomainId;
    this.conflictingManifestId = options.conflictingManifestId;
    this.domainId = options.domainId;
    this.manifestId = options.manifestId;
  }
}

export interface AppRuntime<View = unknown> {
  readonly appId: string;
  componentKeys(): string[];
  resolve(input: { componentKey: string; domainId: string }): WebComponentRegistration<View>;
}

export interface ComposeAppRuntimeOptions<View = unknown> {
  appId: string;
  domainModules: readonly DomainModule[];
  manifests: readonly WebDomainManifest<View>[];
  selectedDomainIds: readonly string[];
  selectedManifestIds: readonly string[];
}

function uniqueById<T extends { id: string }>(
  items: readonly T[],
  createError: (duplicate: T) => AppRuntimeError
): Map<string, T> {
  const result = new Map<string, T>();
  for (const item of items) {
    if (result.has(item.id)) throw createError(item);
    result.set(item.id, item);
  }
  return result;
}

export function composeAppRuntime<View = unknown>({
  appId,
  domainModules,
  manifests,
  selectedDomainIds,
  selectedManifestIds
}: ComposeAppRuntimeOptions<View>): AppRuntime<View> {
  const domainsById = uniqueById(
    domainModules,
    item =>
      new AppRuntimeError({
        appId,
        code: 'duplicate-domain-module',
        componentKey: '*',
        domainId: item.id
      })
  );
  const manifestsById = uniqueById(
    manifests,
    item =>
      new AppRuntimeError({
        appId,
        code: 'duplicate-web-domain-manifest',
        componentKey: '*',
        domainId: item.domainId,
        manifestId: item.id
      })
  );
  const selectedDomains = new Set(selectedDomainIds);

  for (const domainId of selectedDomains) {
    if (!domainsById.has(domainId))
      throw new AppRuntimeError({
        appId,
        code: 'missing-domain-module',
        componentKey: '*',
        domainId
      });
  }

  const components = new Map<string, WebComponentRegistration<View> & { domainId: string; manifestId: string }>();
  for (const manifestId of new Set(selectedManifestIds)) {
    const manifest = manifestsById.get(manifestId);
    if (!manifest)
      throw new AppRuntimeError({
        appId,
        code: 'missing-web-domain-manifest',
        componentKey: '*',
        domainId: 'unknown',
        manifestId
      });
    if (!selectedDomains.has(manifest.domainId))
      throw new AppRuntimeError({
        appId,
        code: 'unselected-domain',
        componentKey: '*',
        domainId: manifest.domainId,
        manifestId
      });
    for (const [componentKey, registration] of Object.entries(manifest.components)) {
      const existing = components.get(componentKey);
      if (existing)
        throw new AppRuntimeError({
          appId,
          code: 'duplicate-component-key',
          componentKey,
          domainId: manifest.domainId,
          manifestId,
          conflictingDomainId: existing.domainId,
          conflictingManifestId: existing.manifestId
        });
      components.set(componentKey, { ...registration, domainId: manifest.domainId, manifestId });
    }
  }

  return Object.freeze({
    appId,
    componentKeys: () => [...components.keys()].toSorted(),
    resolve: ({ componentKey, domainId }) => {
      const registration = components.get(componentKey);
      if (!registration)
        throw new AppRuntimeError({
          appId,
          code: 'missing-component-key',
          componentKey,
          domainId
        });
      return registration;
    }
  });
}
