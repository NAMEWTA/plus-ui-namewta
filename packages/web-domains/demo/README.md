# Demo Web Domain

## Status

- `active`: `@namewta/web-domain-demo` owns the demo table/tree Vue pages and their explicit WebDomainManifest.

## Responsibilities

- Provide Vue list/tree CRUD pages plus an explicit WebDomainManifest containing a message namespace, permission contributions, and stable web registrations.

## Non-responsibilities

- It does not own demo application services, global App layout, generic registry implementation, or backend permissions.

## Allowed dependencies

- Public demo domain, platform app-runtime/contracts, and selected web-kit entries.

## Forbidden dependencies

- Apps, other web-domain internals, concrete adapters, domain deep imports, and global implicit view globs as its public contract.

## Public entrypoints

- `@namewta/web-domain-demo` root exports lazy page factories, the injected `DemoWebRuntime` contract, and `createDemoWebDomain`; manifest contributions are frozen at creation.

## Backend modules

- `backendModules: [ruoyi-demo]`, inherited from demo list/tree capabilities.

## Activation conditions

- Activated in T-05 with stable `demo/demo/index` and `demo/tree/index` keys; root view facades load through the composed registry, while the explicit root `manifest-diagnostic` harness exercises a chosen missing key. Arbitrary backend key integration remains owned by T-07.

## Validation

- Require manifest contribution/deep-freeze tests, duplicate/missing registry tests, keep-alive request-count and explicit manifest-diagnostic harness E2E, lint, typecheck, and App build.