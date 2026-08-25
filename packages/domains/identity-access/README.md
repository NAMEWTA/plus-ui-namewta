# Identity Access Domain

## Status

- `active`: T-07 extends the strict Client/password slice with registration, OAuth, identity/session, and server-menu use cases.

## Responsibilities

- Validate the App-injected OAuth Client before authentication traffic; own context/code/password, registration, OAuth callback/login, logout, user-info, and server-menu transports; validate responses and write through an injected SessionStore.

## Non-responsibilities

- It does not render Vue, access DOM/storage, create Axios, select an App, map Vue routes, evaluate presentation permissions, or administer users, roles, and Clients.

## Allowed dependencies

- Public `@namewta/platform-contracts` ports and `@namewta/platform-app-runtime` metadata only.

## Forbidden dependencies

- Apps, web-domains, web-kit, Vue/Router/Pinia, DOM/browser globals, Axios, concrete adapters, and root `@/` aliases or deep imports.

## Public entrypoints

- `@namewta/domain-identity-access` exports the service factory, strict transport/domain models, `IdentityAccessError`, isolated session-key helper, and frozen `identityAccessDomainModule`.

## Backend modules

- `backendModules: [ruoyi-admin, ruoyi-system]` for `/auth/client/context`, `/auth/code`, `/auth/login`, `/auth/register`, `/auth/social/callback`, `/auth/logout`, `/system/user/getInfo`, and `/system/menu/getRouters`.

## Activation conditions

- A caller must inject a valid ClientContext, HttpClient, and SessionStore. Password login/registration stay unavailable until exact-Boolean Client context and verification succeed; OAuth validates Client context before its auth request.

## Validation

- Unit tests cover zero-request invalid Client/context failures, registration gating, OAuth Client identity, strict request order, captcha responses, identity/menu parsing, session lifecycle, and namespace isolation; architecture/type/lint/workspace gates prove the package remains headless.