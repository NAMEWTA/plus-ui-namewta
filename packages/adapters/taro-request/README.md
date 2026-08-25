# Taro Request Adapter

## Status
- `placeholder`: Taro is not installed, selected, versioned, or included in any build.
## Responsibilities
- Reserve a future implementation of platform HttpClient semantics over the selected Taro request runtime.
## Non-responsibilities
- It does not implement Taro now, own domain endpoints, emulate browser Axios, or choose a miniapp platform.
## Allowed dependencies
- After a dedicated terminal Spec, public platform contracts/http plus the approved Taro request API.
## Forbidden dependencies
- Axios/browser globals, Web domains, Element Plus, Apps other than an explicitly composed Taro terminal, and domain business rules.
## Public entrypoints
- None now; a future `@namewta/adapter-taro-request` root export must be defined by the terminal activation Spec.
## Backend modules
- `backendModules: []`; selected domains retain backend traceability.
## Activation conditions
- A real miniapp requirement must approve Taro/version/platform, auth headers, encryption/download behavior, cancellation, and failure mapping.
## Validation
- Before activation, require README-only/no-manifest scans; after activation, require Taro contract tests, terminal build, architecture checks, and auth/network E2E.
