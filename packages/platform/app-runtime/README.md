# Platform App Runtime

## Status

- `active`: `@namewta/platform-app-runtime` provides the terminal-neutral manifest registry used by the demo pilot.

## Responsibilities

- Filter DomainModule and WebDomainManifest inputs to the App selection before validating duplicates, then compose message namespaces, permission contributions, and stable web registrations.
- Assemble server-authorized menus without a second Client filter and coordinate protected navigation in the fixed identity/menu/add/replace order through injected ports.
- Clone and freeze public contributions, resolve component keys, and report structured duplicate or missing diagnostics without later registrations overwriting earlier ones.

## Non-responsibilities

- It does not own domain pages, App layout, backend menu filtering, Vue Router, or runtime remote-plugin discovery.

## Allowed dependencies

- Public platform contracts plus manifest metadata contracts; concrete manifests are injected by Apps.

## Forbidden dependencies

- Specific Apps/domains/web-domains, Vue page implementations, concrete adapters, deep imports, and remote module loaders.

## Public entrypoints

- `@namewta/platform-app-runtime` root exports manifest contracts, selected-only composition, immutable resolution, server route assembly, missing-key diagnostics, and protected navigation recovery ports.

## Backend modules

- `backendModules: []`; manifests carry domain-specific backend traceability.

## Activation conditions

- Activated by T-05 with the demo domain and its root compatibility consumer; future Apps inject their selected manifests.

## Validation

- Registry and route fixtures cover selected/unselected duplicates, contribution conflicts, mutation, server metadata passthrough, missing keys, and exact `getInfo -> getRouters -> addRoute -> replace`; architecture/type gates and Lead dynamic-route E2E complete validation.