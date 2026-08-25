# Identity Access Domain

## Status
- `placeholder`: login, session, menu, and permission behavior still lives in the root compatibility App.
## Responsibilities
- Own cross-terminal authentication, registration, social callback, current-user/session recovery, Client context, server-menu consumption, and access semantics.
## Non-responsibilities
- It does not render Vue pages, register Router records, show Element messages, persist tokens directly, or administer users/roles/Clients.
## Allowed dependencies
- Public platform contracts/http/auth/permission entries and, after Wave 11, relevant api-contracts.
## Forbidden dependencies
- Apps, web-domains, web-kit, Vue/Router/Pinia, DOM/browser storage, concrete adapters, and system-admin implementation internals.
## Public entrypoints
- Future `@namewta/domain-identity-access` root exports for session use cases, models, permission semantics, and `DomainModule` metadata.
## Backend modules
- `backendModules: [ruoyi-admin, ruoyi-system]` for `/auth/**`, current-user information, roles/permissions, and Client-filtered menus.
## Activation conditions
- Activate across T-06/T-07 only after second-App proof and all Client/auth/401/dynamic-route baselines are preserved.
## Validation
- Require headless import checks, session/access unit matrices, multi-Client auth E2E, route-order tests, lint, typecheck, and both App builds.
