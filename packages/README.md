# Shared Packages

## Status
- `index`: this directory groups active workspace packages and intentional README-only placeholders; the group directories themselves expose no runtime code.
## Responsibilities
- Index current and future platform, domain, Web-domain, Web-kit, adapter, and generated transport-contract boundaries.
## Non-responsibilities
- It is not a generic common/utils container and does not activate packages merely by directory presence.
## Allowed dependencies
- Children may use only the dependency directions and public entries declared in their own contracts.
## Forbidden dependencies
- Package deep imports, dependency cycles, reverse dependencies into Apps, and undeclared same-layer coupling.
## Public entrypoints
- None at this level; each activated child exposes a private `@namewta/*` package root.
## Backend modules
- `backendModules: []`; concrete domain packages own backend traceability.
## Activation conditions
- A migration Ticket must add a focused private package manifest, exports, real source, consumers, and verification together.
## Validation
- Confirm placeholder children contain README files only, have no package manifests, and are absent from workspace discovery.
