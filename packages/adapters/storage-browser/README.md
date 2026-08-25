# Browser Storage Adapter

## Status
- `placeholder`: current token/storage utilities remain active in the root compatibility source.
## Responsibilities
- Implement TokenStorage and approved key/value persistence ports over explicit browser storage mechanisms.
## Non-responsibilities
- It does not define session policy, select token names without migration evidence, own domain state, or access Taro storage.
## Allowed dependencies
- Public platform storage/auth contracts and browser storage APIs selected by the activation Ticket.
## Forbidden dependencies
- Apps, domains, web-domains, web-kit, Axios, Taro APIs, Router/Pinia singletons, and unscoped secrets.
## Public entrypoints
- Future `@namewta/adapter-storage-browser` root export for adapter factories with explicit key/config ownership.
## Backend modules
- `backendModules: []`; storage is a local runtime implementation.
## Activation conditions
- Activate in T-04 only after existing token key, lifecycle, clearing, and multi-App isolation behavior is measured.
## Validation
- Require read/write/clear/isolation unit tests, browser boundary/security review, auth E2E, lint, typecheck, architecture checks, and App builds.
