# Browser Storage Adapter

## Status

- `active`: `@namewta/adapter-storage-browser` backs the root auth compatibility facade.

## Responsibilities

- Implement TokenStorage and approved key/value persistence ports over explicit browser storage mechanisms.

## Non-responsibilities

- It does not define session policy, select token names without migration evidence, own domain state, or access Taro storage.

## Allowed dependencies

- Public platform storage/auth contracts and browser storage APIs selected by the activation Ticket.

## Forbidden dependencies

- Apps, domains, web-domains, web-kit, Axios, Taro APIs, Router/Pinia singletons, and unscoped secrets.

## Public entrypoints

- `@namewta/adapter-storage-browser` root export for token-storage factories with explicit key/config ownership.

## Backend modules

- `backendModules: []`; storage is a local runtime implementation.

## Activation conditions

- Activated in T-04 after existing token key, lifecycle, clearing, and multi-App isolation behavior was measured.

## Validation

- Require read/write/clear/isolation unit tests, browser boundary/security review, auth E2E, lint, typecheck, architecture checks, and App builds.