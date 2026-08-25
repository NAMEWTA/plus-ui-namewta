# Operations Domain

## Status
- `placeholder`: monitoring APIs and models remain under root `src/api/monitor`.
## Responsibilities
- Own online-session, cache, login/operation log, notification, scheduled-task, service-monitor query/action semantics, and safe external-navigation intents.
## Non-responsibilities
- It does not render monitoring pages, operate infrastructure, bypass service permissions, or own browser URL/navigation APIs.
## Allowed dependencies
- Public platform HTTP/navigation contracts and identity-access permission values; later, relevant api-contracts.
## Forbidden dependencies
- Apps, web-domains, web-kit, Vue/DOM, concrete adapters, unsafe raw URL navigation, and unrelated domain internals.
## Public entrypoints
- Future `@namewta/domain-operations` root exports for operations services/models, navigation intents, and `DomainModule` metadata.
## Backend modules
- `backendModules: [ruoyi-system, ruoyi-job]` for monitoring/log/session/notification capabilities and scheduled-task operations.
## Activation conditions
- Activate in T-14 after permission, URL, notification, and failure baselines are fixed and platform ports are available.
## Validation
- Require security/URL negative tests, permission and API failure tests, headless import checks, lint, typecheck, selected-only routes, and dual-App builds.
