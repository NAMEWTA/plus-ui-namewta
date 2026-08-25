# Demo Web Domain

## Status
- `placeholder`: demo pages remain under root `src/views/demo`.
## Responsibilities
- Provide Vue list/tree CRUD pages and components plus the first explicit WebDomainManifest component registry pilot.
## Non-responsibilities
- It does not own demo application services, global App layout, generic registry implementation, or backend permissions.
## Allowed dependencies
- Public demo domain, platform app-runtime/contracts, and selected web-kit entries.
## Forbidden dependencies
- Apps, other web-domain internals, concrete adapters, domain deep imports, and global implicit view globs as its public contract.
## Public entrypoints
- Future `@namewta/web-domain-demo` root export for demo views/messages and `WebDomainManifest`.
## Backend modules
- `backendModules: [ruoyi-demo]`, inherited from demo list/tree capabilities.
## Activation conditions
- Activate in T-05 as the first complete manifest pilot with stable legacy component keys and compatibility facades.
## Validation
- Require CRUD/tree UI tests, duplicate/missing component-key tests, keep-alive and dynamic-route E2E, lint, typecheck, and App build.
