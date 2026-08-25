# Demo Web Domain

## Status

- `active`: `@namewta/web-domain-demo` owns the demo table/tree Vue pages and their explicit WebDomainManifest.

## Responsibilities

- Provide Vue list/tree CRUD pages and components plus the first explicit WebDomainManifest component registry pilot.

## Non-responsibilities

- It does not own demo application services, global App layout, generic registry implementation, or backend permissions.

## Allowed dependencies

- Public demo domain, platform app-runtime/contracts, and selected web-kit entries.

## Forbidden dependencies

- Apps, other web-domain internals, concrete adapters, domain deep imports, and global implicit view globs as its public contract.

## Public entrypoints

- `@namewta/web-domain-demo` root exports lazy page factories, the injected `DemoWebRuntime` contract, and `createDemoWebDomain`.

## Backend modules

- `backendModules: [ruoyi-demo]`, inherited from demo list/tree capabilities.

## Activation conditions

- Activated in T-05 with stable `demo/demo/index` and `demo/tree/index` keys; root view files remain thin compatibility facades until T-15.

## Validation

- Require CRUD/tree UI tests, duplicate/missing component-key tests, keep-alive and dynamic-route E2E, lint, typecheck, and App build.