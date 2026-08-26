# Developer Tools Web Domain

## Status

- `active`: generator list, import, edit, preview and download pages are owned here.

## Responsibilities

- Provide Vue generator configuration, metadata selection, preview/download UI, messages, and devtools manifest mappings.

## Non-responsibilities

- It does not own generation services, backend templates, system dictionary/menu administration, or OpenAPI tooling.

## Allowed dependencies

- Public devtools domain, approved system-admin public selection contracts, platform download/error contracts, and web-kit.

## Forbidden dependencies

- Apps, system-admin implementation pages, other web-domain deep imports, concrete adapters, and direct unsafe file handling.

## Public entrypoints

- `@namewta/web-domain-devtools` exports the manifest; `./pages` exports compatibility pages.

## Backend modules

- Generation uses `ruoyi-admin`; dictionary/menu metadata remains behind system public ports.

## Activation conditions

- Admin-web explicitly selects this manifest; other Apps remain unselected by default.

## Validation

- Require metadata selection, preview/download failure E2E, manifest registration, no deep imports/cycles, lint, typecheck, and selected-App builds.