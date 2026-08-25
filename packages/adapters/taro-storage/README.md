# Taro Storage Adapter

## Status
- `placeholder`: Taro storage dependencies and source are intentionally absent.
## Responsibilities
- Reserve a future TokenStorage/key-value port implementation for the approved Taro terminal runtime.
## Non-responsibilities
- It does not implement storage now, define session policy, reuse browser storage globals, or choose a miniapp platform.
## Allowed dependencies
- After a dedicated terminal Spec, public platform storage/auth contracts plus the approved Taro storage API.
## Forbidden dependencies
- Browser local/session storage, Web domains, Element Plus, unrelated Apps, Axios, and domain business rules.
## Public entrypoints
- None now; a future `@namewta/adapter-taro-storage` root export must be defined by the terminal activation Spec.
## Backend modules
- `backendModules: []`; terminal storage owns no backend capability.
## Activation conditions
- A real terminal requirement must define Taro/version/platform, key isolation, clearing, lifecycle, quota, and security behavior.
## Validation
- Before activation, require README-only/no-manifest scans; after activation, require storage isolation/lifecycle tests, terminal build, architecture review, and auth E2E.
