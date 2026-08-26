# System Administration Domain

## Status

- `active`: T-10 owns the Client, user, user-type, role, menu, department, and post governance slices.

## Responsibilities

- Own Client/user/user-type/role/menu/department/post governance services and models.
- Preserve the T-09 workflow-safe public user-query seam without widening its projected user data.

## Non-responsibilities

- It does not own current-session authentication, global route guards, Vue administration pages, workflow rules, or code-generator behavior.
- Dictionary, configuration, notice, OSS, message, and social-resource administration remain reserved for T-11.

## Allowed dependencies

- Public platform contracts/runtime and explicit transport contracts; expose only explicit cross-domain ports.

## Forbidden dependencies

- Apps, web-domains, web-kit, Vue/DOM, concrete adapters, workflow/devtools implementations, and cyclic same-layer imports.

## Public entrypoints

- `@namewta/domain-system-admin` exports the seven governance services/models and the domain capability descriptor.
- `@namewta/domain-system-admin/public/user` exports minimal workflow-safe user summaries and an injected `UserQueryPort`; list and option responses are projected at runtime so extra user/PII fields cannot cross the seam.

## Backend modules

- `backendModules: [ruoyi-system]` for the active governance endpoints.

## Activation conditions

- Admin-web selects the domain and its web manifest. Other Apps receive no governance registrations unless they explicitly select both.
- The current-session profile transport is exposed for the existing host profile page, but that static host route is not a T-10 manifest registration.

## Validation

- Transport matrix tests lock all existing paths and methods; public-seam tests prove projection; manifest/E2E tests cover selected-only registration, permissions, Client-scoped failures, and dual-App behavior.