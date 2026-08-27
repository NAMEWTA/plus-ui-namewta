# Operations Web Domain

## Status

- `active`: T-14 owns the Vue presentation and manifest registrations for the operations domain.

## Responsibilities

- Provide online-session, cache, operation-log, login-info, notification-log, and three external-monitor pages under the legacy component keys.
- Accept request, permission, dictionary, modal, export, attachment-download, iframe, and configured external URL capabilities through `OperationsWebRuntime`.
- Render permission/configuration failures visibly and invoke iframe/download effects only with an approved domain navigation intent.

## Non-responsibilities

- It does not own monitor transports/models, URL trust decisions, backend authorization, global routing, the application shell, or concrete App adapters.
- It does not copy App-owned iframe/download/security implementations or select itself for an App.

## Allowed dependencies

- Public operations domain, platform app-runtime, Vue, Element Plus, ECharts, and Vue JSON Pretty.

## Forbidden dependencies

- Apps, other web-domain internals, concrete adapters, App internals, domain deep imports, global router/request modules, and browser effects outside injected runtime ports.

## Public entrypoints

- `@namewta/web-domain-operations` exports the typed runtime contract, live dictionary adapter, and `createOperationsWebDomain`; `@namewta/web-domain-operations/pages` exports compatibility-safe page components.

## Backend modules

- `backendModules: [ruoyi-system]`, inherited from the operations domain; external monitor deployments remain host configuration rather than package dependencies.

## Activation conditions

- An App must explicitly select both `operations` and `web-domain-operations`; admin-web does so and client-web does not.
- External pages require their target-specific permission and safe configured URL. Notification attachment download additionally requires query permission and a successful safe URL authorization response.

## Validation

- Require manifest key/permission inventory tests, visible permission/unsafe URL/API failure behavior with zero downstream effect, strict unknown-request E2E, client unselected diagnostics, architecture checks, lint, typecheck, unit tests, and production builds.
