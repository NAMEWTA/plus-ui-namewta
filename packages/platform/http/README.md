# Platform HTTP

## Status
- `placeholder`: no HttpClient orchestration package is active.
## Responsibilities
- Own transport-neutral request orchestration, classified failures, auth metadata, repeat-submit semantics, and adapter-facing HTTP contracts.
## Non-responsibilities
- It does not own Axios instances, Element Plus messages, Router navigation, domain endpoints, or browser encryption implementation.
## Allowed dependencies
- Public `platform-contracts` and narrowly required transport-neutral types.
## Forbidden dependencies
- Apps, domains, web-domains, web-kit, browser/Taro globals, and concrete adapters.
## Public entrypoints
- Future `@namewta/platform-http` root exports for HttpClient-facing orchestration and error contracts.
## Backend modules
- `backendModules: []`; endpoint ownership remains in domains and generated API contracts.
## Activation conditions
- Activate with browser adapters after request 401/encryption/download/repeat-submit behavior is characterized and preserved.
## Validation
- Run request contract/unit tests, architecture import checks, typecheck, lint, and both App integration gates when consumers exist.
