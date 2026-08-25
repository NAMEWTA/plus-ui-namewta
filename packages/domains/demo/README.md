# Demo Domain

## Status
- `placeholder`: demo list/tree APIs and models remain in the root compatibility source.
## Responsibilities
- Own the sample list and tree CRUD transport contracts, models, application services, validation, and domain metadata used by the first pilot.
## Non-responsibilities
- It does not render demo Vue pages, own App navigation/layout, define platform registries, or authorize backend operations.
## Allowed dependencies
- Public platform contracts/http and, after Wave 11, demo api-contracts.
## Forbidden dependencies
- Apps, web-domains, web-kit, Vue/Router/DOM, concrete adapters, and other domain internals.
## Public entrypoints
- Future `@namewta/domain-demo` root exports for list/tree services, models, permissions, and `DomainModule` metadata.
## Backend modules
- `backendModules: [ruoyi-demo]` for demo table and tree example endpoints.
## Activation conditions
- Activate in T-05 as the first full domain/web-domain/manifest pilot while preserving legacy imports through a facade.
## Validation
- Require CRUD/tree unit/integration tests, headless import checks, public-entry-only consumption, lint, typecheck, manifest routes, and App build.
