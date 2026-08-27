# System Administration Domain

## Status

- `active`: T-10 activated governance; T-11 adds dictionary, configuration, notice, OSS, OSS configuration, message, and social-resource contracts.

## Responsibilities

- Own Client/user/user-type/role/menu/department/post governance and resource/content services and models.
- Validate backend-issued OSS and presigned upload URLs at the domain boundary before browser code can consume them.
- Preserve the T-09 workflow-safe public user-query seam without widening its projected user data.
- Provide minimal public dictionary and recursively projected menu query ports with stable fields and explicit Client scope.

## Non-responsibilities

- It does not own current-session authentication, global route guards, Vue administration pages, workflow rules, or code-generator behavior.
- It does not perform browser upload/download, render HTML, own OSS credentials, or log tokens, signed URLs, request headers, or response objects.

## Allowed dependencies

- Public platform contracts/runtime and explicit transport contracts; expose only explicit cross-domain ports.

## Forbidden dependencies

- Apps, web-domains, web-kit, Vue/DOM, concrete adapters, workflow/devtools implementations, and cyclic same-layer imports.

## Public entrypoints

- `@namewta/domain-system-admin` exports governance/resource services and models plus the domain capability descriptor.
- `@namewta/domain-system-admin/public/dict` and `/public/menu` expose projected cross-domain query ports without administration internals.
- `@namewta/domain-system-admin/public/user` exports minimal workflow-safe user summaries and an injected `UserQueryPort`; list and option responses are projected at runtime so extra user/PII fields cannot cross the seam.

## Backend modules

- `backendModules: [ruoyi-system]` for `/system/**`, `/resource/**`, and the existing social-auth bindings.

## Activation conditions

- Admin-web selects the domain and its web manifest. Other Apps receive no governance registrations unless they explicitly select both.
- The current-session profile transport is exposed for the existing host profile page, but that static host route is not a T-10 manifest registration.

## Validation

- Transport matrix tests lock all existing paths and methods; social binding/list results have concrete public models; public seams prove projection and Client-scoped failure propagation. OSS list resolution never falls back after authorization failure, and OSS/notice attachment security tests reject unsafe URLs without retaining secrets.

## OpenAPI boundary

- `SysUserVo` is generated transport; `projectSystemUserTransport` maps it into the stable public `UserSummary` contract.