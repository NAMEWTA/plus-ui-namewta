# Developer Tools Web Domain

## Status
- `placeholder`: generator pages remain under root `src/views/tool`.
## Responsibilities
- Provide Vue generator configuration, metadata selection, preview/download UI, messages, and devtools manifest mappings.
## Non-responsibilities
- It does not own generation services, backend templates, system dictionary/menu administration, or OpenAPI tooling.
## Allowed dependencies
- Public devtools domain, approved system-admin public selection contracts, platform download/error contracts, and web-kit.
## Forbidden dependencies
- Apps, system-admin implementation pages, other web-domain deep imports, concrete adapters, and direct unsafe file handling.
## Public entrypoints
- Future `@namewta/web-domain-devtools` root export for generator views/components/messages and `WebDomainManifest`.
## Backend modules
- `backendModules: [ruoyi-gen, ruoyi-system]`, matching generation and explicit dictionary/menu metadata sources.
## Activation conditions
- Activate in T-13 after devtools services and system public ports exist and download behavior is characterized.
## Validation
- Require metadata selection, preview/download failure E2E, manifest registration, no deep imports/cycles, lint, typecheck, and selected-App builds.
