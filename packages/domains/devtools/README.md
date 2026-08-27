# Developer Tools Domain

## Status

- `active`: transport and models are owned here; T-15 retired the root `src/api/tool/gen` compatibility facade.

## Responsibilities

- Own generator configuration, metadata queries, preview/download orchestration, generated-file result handling, and devtools permissions.

## Non-responsibilities

- It does not render generator Vue pages, implement backend templates, generate OpenAPI clients, or administer dictionaries/menus.

## Allowed dependencies

- Public platform HTTP/download contracts and explicit `system-admin/public/dict` and `public/menu` ports.

## Forbidden dependencies

- Apps, web-domains, web-kit, Vue/DOM, concrete adapters, system-admin internals, and OpenAPI tooling runtime code.

## Public entrypoints

- `@namewta/domain-devtools` exports generator services/models and `DomainModule` metadata.

## Backend modules

- `backendModules: [ruoyi-gen, ruoyi-system]`; system metadata is consumed only through public ports.

## Activation conditions

- Admin-web explicitly selects the domain and its web manifest.

## Validation

- Require metadata-port contracts, preview/download negative tests, no deep imports/cycles, sensitive metadata review, lint, typecheck, and selected-App E2E/build.
