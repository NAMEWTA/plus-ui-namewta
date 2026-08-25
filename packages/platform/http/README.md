# Platform HTTP

## Status

- `active`: `@namewta/platform-http` owns transport-neutral error classification used by runtime HTTP adapters.

## Responsibilities

- Own transport-neutral request orchestration and stable `TransportError` classification with kind, message, optional code, sanitized cause metadata, and explicit handled state.

## Non-responsibilities

- It does not own Axios instances, Element Plus messages, Router navigation, domain endpoints, or browser encryption implementation.

## Allowed dependencies

- Public `platform-contracts` and narrowly required transport-neutral types.

## Forbidden dependencies

- Apps, domains, web-domains, web-kit, browser/Taro globals, and concrete adapters.

## Public entrypoints

- `@namewta/platform-http` root exports `TransportError`, its factory/guards, and transport-message policies.

## Backend modules

- `backendModules: []`; endpoint ownership remains in domains and generated API contracts.

## Activation conditions

- Activated in T-04 after request 401/encryption/download/repeat-submit behavior was characterized and preserved.

## Validation

- Run structured-error/sanitized-cause/handled unit tests, request contract tests, architecture import checks, typecheck, lint, and both App integration gates when consumers exist.