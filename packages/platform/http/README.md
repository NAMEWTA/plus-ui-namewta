# Platform HTTP

## Status

- `active`: `@namewta/platform-http` owns pure error classification used by browser HTTP adapters.

## Responsibilities

- Own transport-neutral request orchestration, classified failures, auth metadata, repeat-submit semantics, and adapter-facing HTTP contracts.

## Non-responsibilities

- It does not own Axios instances, Element Plus messages, Router navigation, domain endpoints, or browser encryption implementation.

## Allowed dependencies

- Public `platform-contracts` and narrowly required transport-neutral types.

## Forbidden dependencies

- Apps, domains, web-domains, web-kit, browser/Taro globals, and concrete adapters.

## Public entrypoints

- `@namewta/platform-http` root exports handled-error and transport-message policies.

## Backend modules

- `backendModules: []`; endpoint ownership remains in domains and generated API contracts.

## Activation conditions

- Activated in T-04 after request 401/encryption/download/repeat-submit behavior was characterized and preserved.

## Validation

- Run request contract/unit tests, architecture import checks, typecheck, lint, and both App integration gates when consumers exist.