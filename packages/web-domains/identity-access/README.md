# Identity Access Web Domain

## Status

- `active-minimal`: T-06 activates an injectable Vue password-login page and identity WebDomainManifest; broader auth surfaces remain T-07 work.

## Responsibilities

- Render accessible login and captcha controls, refresh the complete preparation sequence while submit remains disabled, keep submit disabled on terminal fail-close, hand credentials to the injected service, and publish stable message/permission/registration contributions.

## Non-responsibilities

- It does not own session truth, Client selection, HTTP/storage/crypto adapters, App layout/navigation, registration/social flows, or backend authorization.

## Allowed dependencies

- Public identity-access domain and app-runtime contracts plus Vue and Element Plus presentation dependencies.

## Forbidden dependencies

- Apps, concrete adapters, root `src/**`, other web-domain internals, direct Axios/backend calls, Router/Store singletons, and package deep imports.

## Public entrypoints

- `@namewta/web-domain-identity-access` exports `createIdentityAccessWebDomain` and `IdentityAccessWebRuntime`; component key `identity-access/login/index` resolves to keep-alive name `IdentityLogin`.

## Backend modules

- `backendModules: [ruoyi-admin, ruoyi-system]`, consumed only through the injected headless identity service.

## Activation conditions

- The App must provide a fully configured service and authentication completion callback; an absent runtime fails before the manifest is composed.

## Validation

- Manifest and presentation-state tests freeze stable contributions, reject missing runtime, and prove captcha refresh stays disabled until a new challenge succeeds; client unit/build plus Lead E2E verify terminal fail-close and successful injected login.