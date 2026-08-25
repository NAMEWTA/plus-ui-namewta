# Shared Package Placeholders

## Status
- `placeholder`: these directories are not workspace packages and expose no runtime code.
## Responsibilities
- Index future platform, domain, Web-domain, Web-kit, adapter, and generated transport-contract boundaries.
## Non-responsibilities
- It is not a generic common/utils container and does not activate packages merely by directory presence.
## Allowed dependencies
- Activated children may use only the dependency directions and public entries declared in their own contracts.
## Forbidden dependencies
- Package deep imports, dependency cycles, reverse dependencies into Apps, and undeclared same-layer coupling.
## Public entrypoints
- None at this level; each activated child will expose a private `@namewta/*` package root.
## Backend modules
- `backendModules: []`; concrete domain packages own backend traceability.
## Activation conditions
- A migration Ticket must add a focused private package manifest, exports, real source, consumers, and verification together.
## Validation
- Confirm placeholders contain README files only, have no package manifests, and are absent from workspace discovery.
