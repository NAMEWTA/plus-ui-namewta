# Platform Contracts

## Status

- `active`: `@namewta/platform-contracts` exports the terminal-neutral ports used by T-04 adapters.

## Responsibilities

- Define terminal-neutral ports such as HttpClient, TokenStorage, ClientContext, ErrorPresenter, NavigationPort, and stable error/result shapes.

## Non-responsibilities

- It does not implement Axios, storage, crypto, UI feedback, navigation, authentication workflows, or business domains.

## Allowed dependencies

- Type-only standard-library primitives and deliberately approved transport-neutral contract types.

## Forbidden dependencies

- Domains, Apps, Vue, Vue Router, Element Plus, DOM globals, Axios, Taro, and concrete adapters.

## Public entrypoints

- `@namewta/platform-contracts` root exports for stable port types and ClientContext validation.

## Backend modules

- `backendModules: []`; contracts are frontend runtime boundaries, not a backend capability domain.

## Activation conditions

- Activated in T-04 because the browser adapters consume these ports and their contract tests cover each active boundary.

## Validation

- Enforce no framework/runtime imports, public-root-only consumption, typecheck, unit contract tests, and architecture checks.