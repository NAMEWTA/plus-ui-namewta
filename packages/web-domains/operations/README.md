# Operations Web Domain

## Status
- `placeholder`: monitoring pages remain under root `src/views/monitor`.
## Responsibilities
- Provide Vue views for online sessions, cache, logs, notifications, jobs, service monitoring, safe external links, and operations manifest entries.
## Non-responsibilities
- It does not own operations services, infrastructure deployment, App shell, backend authorization, or raw URL trust decisions.
## Allowed dependencies
- Public operations domain, identity-access permission presentation, platform navigation/error contracts, and selected web-kit entries.
## Forbidden dependencies
- Apps, other web-domain internals, concrete adapters, unsafe URL bypasses, and direct domain/internal transport paths.
## Public entrypoints
- Future `@namewta/web-domain-operations` root export for monitoring views/messages and `WebDomainManifest`.
## Backend modules
- `backendModules: [ruoyi-system, ruoyi-job]`, matching monitor/log/session/notification and task-operation sources.
## Activation conditions
- Activate in T-14 only for Apps explicitly selecting operations after security and permission behavior is fixed.
## Validation
- Require permission/unsafe-URL/API failure E2E, selected-only route checks, manifest tests, lint, typecheck, architecture checks, and dual-App builds.
