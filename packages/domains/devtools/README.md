# Developer Tools Domain

## Status
- `placeholder`: code-generation transport and models remain under root `src/api/tool/gen`.
## Responsibilities
- Own generator configuration, metadata queries, preview/download orchestration, generated-file result handling, and devtools permissions.
## Non-responsibilities
- It does not render generator Vue pages, implement backend templates, generate OpenAPI clients, or administer dictionaries/menus.
## Allowed dependencies
- Public platform HTTP/download contracts and explicit `system-admin/public/dict` and `public/menu` ports.
## Forbidden dependencies
- Apps, web-domains, web-kit, Vue/DOM, concrete adapters, system-admin internals, and OpenAPI tooling runtime code.
## Public entrypoints
- Future `@namewta/domain-devtools` root exports for generator services/models and `DomainModule` metadata.
## Backend modules
- `backendModules: [ruoyi-gen, ruoyi-system]` for generation endpoints and explicitly consumed dictionary/menu metadata.
## Activation conditions
- Activate in T-13 after system public ports exist and preview/download failure behavior is covered.
## Validation
- Require metadata-port contracts, preview/download negative tests, no deep imports/cycles, sensitive metadata review, lint, typecheck, and selected-App E2E/build.
