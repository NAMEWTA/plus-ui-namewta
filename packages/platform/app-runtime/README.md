# Platform App Runtime

## Status

- `active`: `@namewta/platform-app-runtime` provides the terminal-neutral manifest registry used by the demo pilot.

## Responsibilities

- Compose DomainModule and WebDomainManifest contributions, validate selected-domain relationships, and diagnose duplicate/missing component keys.

## Non-responsibilities

- It does not own domain pages, App layout, backend menu filtering, or runtime remote-plugin discovery.

## Allowed dependencies

- Public platform contracts plus manifest metadata contracts; concrete manifests are injected by Apps.

## Forbidden dependencies

- Specific Apps/domains/web-domains, Vue page implementations, concrete adapters, deep imports, and remote module loaders.

## Public entrypoints

- `@namewta/platform-app-runtime` root exports for DomainModule/WebDomainManifest contracts, selected-only composition, resolution, and structured diagnostics.

## Backend modules

- `backendModules: []`; manifests carry domain-specific backend traceability.

## Activation conditions

- Activated by T-05 with the demo domain and its root compatibility consumer; future Apps inject their selected manifests.

## Validation

- Require registry unit fixtures, route integration, selected-only bundle checks, architecture/type gates, and dynamic-route Playwright coverage.