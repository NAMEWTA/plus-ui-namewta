# AI Domain

## Status

- `active`: `@namewta/domain-ai` owns the current Snail AI user-registration transport and embedded-chat metadata.

## Responsibilities

- Own the current-user registration request/response contract, injected application service, and traceable domain metadata.

## Non-responsibilities

- It does not render the chat iframe, own browser credentials or URLs, provide model infrastructure, or expose credentials to logs.

## Allowed dependencies

- Public platform contracts/http, app-runtime metadata, and generated transport types from api-contracts.

## Forbidden dependencies

- Apps, web-domains, web-kit, Vue/DOM, concrete browser adapters, and unrelated domains.

## Public entrypoints

- `@namewta/domain-ai` exports the typed registration service/model and `aiDomainModule` metadata.

## Backend modules

- `backendModules: [ruoyi-ai]` for current-user Snail AI registration.

## Activation conditions

- Activated in T-12; T-15 retired the root `src/api/ai/**` compatibility facade after consumer scans passed.

## Validation

- Require headless import checks, exact transport tests, secret/log review, lint, typecheck, manifest E2E, and dual-App build selection.

## OpenAPI boundary

- `OpenApiUserVO` is generated transport; `projectAiUserTransport` maps it into `SnailOpenApiUser` without exposing schema ownership to callers.