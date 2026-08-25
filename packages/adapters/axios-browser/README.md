# Axios Browser Adapter

## Status
- `placeholder`: the existing root request utility remains the active browser transport.
## Responsibilities
- Implement platform HttpClient for browsers using Axios, including headers, encryption handoff, downloads, repeat-submit, timeout, and classified failures.
## Non-responsibilities
- It does not own endpoint DTOs, session/domain workflows, UI messages, Router navigation, or service authorization.
## Allowed dependencies
- Public platform contracts/http/auth ports, Axios, and narrowly scoped browser crypto/storage ports.
## Forbidden dependencies
- Apps, domains, web-domains, web-kit, Taro APIs, and deep imports into consumers.
## Public entrypoints
- Future `@namewta/adapter-axios-browser` root export for adapter construction/configuration, not a global singleton.
## Backend modules
- `backendModules: []`; domains own endpoint traceability.
## Activation conditions
- Activate in T-04 after current 401, encryption, download, repeat-submit, and Client-header behavior is characterized.
## Validation
- Require adapter/request unit tests, 401 and encrypted-login E2E, resource cleanup review, lint, typecheck, architecture checks, and App builds.
