# System Administration Web Domain

## Status
- `placeholder`: system management pages remain under root `src/views/system`.
## Responsibilities
- Provide Vue administration pages/components/composables and manifest entries for governance, configuration, content, OSS, messages, and social resources.
## Non-responsibilities
- It does not own system application services, global shell/layout, current-session authentication, workflow UI, or backend authorization.
## Allowed dependencies
- Public system-admin domain, platform contracts, and selected web-kit UI/file/form capabilities.
## Forbidden dependencies
- Apps, other web-domain internals, concrete adapters, domain deep imports, and root compatibility internals after facade removal.
## Public entrypoints
- Future `@namewta/web-domain-system-admin` root export for pages, messages, component registry, and `WebDomainManifest`.
## Backend modules
- `backendModules: [ruoyi-system]`, inherited from governance and resource-service capabilities.
## Activation conditions
- Activate across T-10/T-11 after its domain slices and required web-kit boundaries have real consumers and tests.
## Validation
- Require page/manifest CRUD paths, OSS/upload/download security cases, selected-only registration, lint, typecheck, architecture checks, and dual-App builds.
