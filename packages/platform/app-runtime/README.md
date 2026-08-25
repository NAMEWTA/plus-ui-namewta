# Platform App Runtime

## Status
- `placeholder`: no manifest registry or App composition runtime package exists.
## Responsibilities
- Compose DomainModule and WebDomainManifest contributions, validate selected-domain relationships, and diagnose duplicate/missing component keys.
## Non-responsibilities
- It does not own domain pages, App layout, backend menu filtering, or runtime remote-plugin discovery.
## Allowed dependencies
- Public platform contracts plus manifest metadata contracts; concrete manifests are injected by Apps.
## Forbidden dependencies
- Specific Apps/domains/web-domains, Vue page implementations, concrete adapters, deep imports, and remote module loaders.
## Public entrypoints
- Future `@namewta/platform-app-runtime` root exports for registry composition, resolution, and structured diagnostics.
## Backend modules
- `backendModules: []`; manifests carry domain-specific backend traceability.
## Activation conditions
- Activate with the demo pilot when one real App/manifest consumer can prove selection, duplicate, and missing-key behavior.
## Validation
- Require registry unit fixtures, route integration, selected-only bundle checks, architecture/type gates, and dynamic-route Playwright coverage.
