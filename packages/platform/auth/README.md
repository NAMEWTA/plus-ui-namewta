# Platform Authentication

## Status

- `active`: `@namewta/platform-auth` provides injected, terminal-neutral relogin coordination to admin-web; other Apps may choose their own implementation of the same platform ports.

## Responsibilities

- Define terminal-neutral session orchestration and keep one recovery lock from confirmation through logout and navigation, releasing it in every terminal outcome.

## Non-responsibilities

- It does not render login pages, own OAuth endpoint DTOs, select an App clientId, perform service authorization, or import identity-access/domain code; domain and App callers provide validated values through platform-owned contracts.

## Allowed dependencies

- Public platform contracts/http/permission entries only; all session input and callback types used here are defined by platform.

## Forbidden dependencies

- Every domain package, Apps, Vue/Router singletons, Element Plus, DOM/storage globals, and concrete adapters; platform must not reverse the `domains -> platform` direction.

## Public entrypoints

- `@namewta/platform-auth` root exports for singleton relogin coordination and lifecycle contracts.

## Backend modules

- `backendModules: []`; identity-access traces `/auth/**` and system session sources.

## Activation conditions

- Activated in T-04 after login, Client fail-close, 401 singleton, and route recovery baselines remained green.

## Validation

- Require pending-prompt/logout/navigation and synchronous-failure unit tests, multi-Client and 401 Playwright matrices, architecture checks, typecheck, lint, and App builds.
