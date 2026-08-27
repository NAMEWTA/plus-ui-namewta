# Demo Domain

## Status

- `active`: `@namewta/domain-demo` owns demo table/tree transport types, services, and DomainModule metadata.

## Responsibilities

- Own the sample list and tree CRUD transport contracts, models, application services, path-segment ID encoding, validation, and domain metadata used by the first pilot.

## Non-responsibilities

- It does not render demo Vue pages, own App navigation/layout, define platform registries, or authorize backend operations.

## Allowed dependencies

- Public platform contracts/http and, after Wave 11, demo api-contracts.

## Forbidden dependencies

- Apps, web-domains, web-kit, Vue/Router/DOM, concrete adapters, and other domain internals.

## Public entrypoints

- `@namewta/domain-demo` root exports the injected service factory, table/tree models, transport result types, and `demoDomainModule`.

## Backend modules

- `backendModules: [ruoyi-demo]` for demo table and tree example endpoints.

## Activation conditions

- Activated in T-05; T-15 retired the root `src/api/demo/**` compatibility facade after consumer scans passed.

## Validation

- Require CRUD/tree unit tests including single and comma-preserving batch ID encoding, headless import checks, public-entry-only consumption, lint, typecheck, manifest routes, and App build.

## OpenAPI boundary

- `TestDemoVo` is imported as generated transport only; `projectDemoTransport` maps it into the domain-owned `DemoVO`.