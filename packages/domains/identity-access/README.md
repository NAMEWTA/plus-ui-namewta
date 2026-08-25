# Identity Access Domain

## Status

- `active-minimal`: T-06 activates strict Client context, password login, and isolated session contracts; T-07 owns full auth/permission migration.

## Responsibilities

- Validate the App-injected OAuth Client before authentication traffic, preserve context-to-code-to-login order, build the password payload, validate the token response, and write through an injected SessionStore.

## Non-responsibilities

- It does not render Vue, access DOM/storage, create Axios, select an App, implement registration/social/permission recovery, or administer users, roles, and Clients.

## Allowed dependencies

- Public `@namewta/platform-contracts` ports and `@namewta/platform-app-runtime` metadata only.

## Forbidden dependencies

- Apps, web-domains, web-kit, Vue/Router/Pinia, DOM/browser globals, Axios, concrete adapters, and root `@/` aliases or deep imports.

## Public entrypoints

- `@namewta/domain-identity-access` exports the service factory, strict transport/domain models, `IdentityAccessError`, isolated session-key helper, and frozen `identityAccessDomainModule`.

## Backend modules

- `backendModules: [ruoyi-admin, ruoyi-system]` for `/auth/client/context`, `/auth/code`, and `/auth/login`.

## Activation conditions

- A caller must inject a valid ClientContext, HttpClient, and SessionStore. Login stays unavailable until the exact-Boolean public Client context and verification response succeed.

## Validation

- Unit tests cover zero-request invalid Client/context failures, strict request order, body Client identity, session writes, response validation, and namespace isolation; architecture/type/lint/workspace gates prove the package remains headless.