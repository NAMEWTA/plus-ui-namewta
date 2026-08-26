# Operations Domain

## Status

- `active`: T-14 owns the monitor and operations application services and transport models.

## Responsibilities

- Own cache, online-session, login-info, operation-log, notification-log, attachment authorization, and external monitor contracts.
- Encode every dynamic path segment and create immutable embed/download intents only after permission and structured URL validation succeed.
- Fail closed with stable, non-sensitive errors for missing permissions, missing URLs, malformed URLs, non-HTTP(S) absolute URLs, or credential-bearing URLs.

## Non-responsibilities

- It does not render Vue pages, access DOM/browser storage, perform navigation or downloads, own global request/session behavior, or configure deployment URLs.
- It does not own Monitor Admin, SnailJob, or SnailAI server implementation and authorization.

## Allowed dependencies

- Public platform contracts and app-runtime metadata supplied through explicit ports.

## Forbidden dependencies

- Apps, web-domains, web-kit, Vue/Element Plus, DOM/browser globals, concrete adapters, root `src` modules, and unrelated domains.

## Public entrypoints

- `@namewta/domain-operations` exports `createOperationsService`, resource models, the capability descriptor, permission inventory, structured security errors, and immutable navigation intent types.

## Backend modules

- `backendModules: [ruoyi-system]` for monitor APIs; external Monitor Admin, SnailJob, and SnailAI remain separately deployed services reached through validated host configuration.

## Activation conditions

- An App must explicitly select `operations`; transport consumers may use the headless service without selecting the web manifest.
- External and attachment effects additionally require the matching permission and a URL accepted by the shared root-relative/HTTP(S) policy.

## Validation

- Require the complete endpoint/method matrix, per-segment encoding, malformed host/port/percent/IPv6 and credential URL rejection, iframe/download boundary parity, architecture checks, lint, typecheck, unit tests, and selected/unselected E2E evidence.
