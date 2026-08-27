# Element Web UI Kit

## Status
- `placeholder`: existing Element components remain App-owned in `apps/admin-web/src/components` until multiple consumers justify an extraction slice.
## Responsibilities
- Provide cross-domain Element Plus components and composables with stable Web-only UI contracts.
## Non-responsibilities
- It does not own domain workflows, backend APIs, App composition/layout, or headless platform contracts.
## Allowed dependencies
- Vue, Element Plus, design tokens, and narrowly scoped public platform presentation types.
## Forbidden dependencies
- Domains, Apps, web-domain internals, Router/Store singletons unless explicitly part of a component contract, and backend transport.
## Public entrypoints
- Future `@namewta/web-ui-element` root exports for proven reusable components only; no catch-all barrel is planned.
## Backend modules
- `backendModules: []`; reusable UI is backend-agnostic.
## Activation conditions
- Extract a component only when multiple real consumers establish a stable shared contract and ownership boundary.
## Validation
- Require component behavior/accessibility tests, consumer evidence, no-domain-import checks, lint, typecheck, and representative App builds.
