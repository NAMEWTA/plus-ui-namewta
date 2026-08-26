# System Administration Domain

## Status

- `active-minimal`: T-09 activates only the public user-query seam; broader system administration remains a T-10 placeholder.

## Responsibilities

- Own Client/user/user-type/role/menu/department/post governance plus dictionary, configuration, notice, OSS, message, and social-resource application services.

## Non-responsibilities

- It does not own current-session authentication, global route guards, Vue administration pages, workflow rules, or code-generator behavior.

## Allowed dependencies

- Public platform contracts/http and explicit transport contracts; expose minimal user, dictionary, and menu ports to authorized peer domains.

## Forbidden dependencies

- Apps, web-domains, web-kit, Vue/DOM, concrete adapters, workflow/devtools implementations, and cyclic same-layer imports.

## Public entrypoints

- `@namewta/domain-system-admin/public/user` exports minimal workflow-safe user summaries and an injected `UserQueryPort`; list and option responses are projected at runtime so extra user/PII fields cannot cross the seam.

## Backend modules

- `backendModules: [ruoyi-system]` for governance, configuration, content, resource, message, and social administration endpoints.

## Activation conditions

- The user seam is active for workflow; T-10 may expand the package without widening or breaking this public contract.

## Validation

- Public-seam tests feed wider backend user objects and prove list/options retain only UserSummary fields; architecture, lint, typecheck, and dual-App builds retain the headless boundary.