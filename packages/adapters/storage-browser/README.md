# Browser Storage Adapter

## Status

- `active`: `@namewta/adapter-storage-browser` backs the auth composition in admin-web and client-web.

## Responsibilities

- Implement TokenStorage and SessionStore over explicit browser storage, with isolated in-memory continuity only when storage is unavailable or an operation raises a browser storage exception. A successful null read clears stale fallback state.

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

- Require read/write/clear/isolation, external-removal, and SecurityError/QuotaExceededError unit tests, browser boundary/security review, auth E2E, lint, typecheck, architecture checks, and App builds.
