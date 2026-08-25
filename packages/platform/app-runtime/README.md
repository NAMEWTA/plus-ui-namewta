# Platform App Runtime

## Status

- `active`: `@namewta/platform-app-runtime` provides the terminal-neutral manifest registry used by the demo pilot.

## Responsibilities

- Filter DomainModule and WebDomainManifest inputs to the App selection before validating duplicates, then compose message namespaces, permission contributions, and stable web registrations.
- Clone and freeze public contributions, resolve component keys, and report structured duplicate or missing diagnostics without later registrations overwriting earlier ones.

## Non-responsibilities

- It does not own domain pages, App layout, backend menu filtering, or runtime remote-plugin discovery.

## Allowed dependencies

- Public platform contracts plus manifest metadata contracts; concrete manifests are injected by Apps.

## Forbidden dependencies

- Specific Apps/domains/web-domains, Vue page implementations, concrete adapters, deep imports, and remote module loaders.

## Public entrypoints

- `@namewta/platform-app-runtime` root exports for DomainModule/WebDomainManifest message, permission, and web-registration contracts, selected-only composition, immutable resolution, and structured diagnostics.

## Backend modules

- `backendModules: []`; manifests carry domain-specific backend traceability.

## Activation conditions

- Activated by T-05 with the demo domain and its root compatibility consumer; future Apps inject their selected manifests.

## Validation

- Require registry unit fixtures for selected/unselected duplicates, namespace/contribution/key conflicts and mutation attempts; route integration; architecture/type gates; and dynamic-route Playwright coverage.