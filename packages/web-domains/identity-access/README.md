# Identity Access Web Domain

## Status

- `active`: the injectable identity presentation manifest is selected by client-web; admin keeps its compatibility markup while consuming domain-owned messages and use cases until T-15.

## Responsibilities

- Render accessible login and captcha controls, refresh the complete preparation sequence while submit remains disabled, keep submit disabled on terminal fail-close, hand credentials to the injected service, and publish stable message/permission/registration contributions.

## Non-responsibilities

- It does not own session truth, Client selection, HTTP/storage/crypto adapters, App layout/navigation, or backend authorization. Admin registration/social markup remains a compatibility facade during expand-migrate.

## Allowed dependencies

- Public identity-access domain and app-runtime contracts plus Vue and Element Plus presentation dependencies.

## Forbidden dependencies

- Apps, concrete adapters, root `src/**`, other web-domain internals, direct Axios/backend calls, Router/Store singletons, and package deep imports.

## Public entrypoints

- `@namewta/web-domain-identity-access` exports `createIdentityAccessWebDomain`, `IdentityAccessWebRuntime`, and immutable shared auth messages; component key `identity-access/login/index` resolves to keep-alive name `IdentityLogin`.

## Backend modules

- `backendModules: [ruoyi-admin, ruoyi-system]`, consumed only through the injected headless identity service.

## Activation conditions

- The App must provide a fully configured service and authentication completion callback; an absent runtime fails before the manifest is composed.

## Validation

- Manifest and presentation-state tests freeze stable contributions, reject missing runtime, and prove captcha refresh stays disabled until a new challenge succeeds; client unit/build plus Lead E2E verify terminal fail-close and successful injected login.