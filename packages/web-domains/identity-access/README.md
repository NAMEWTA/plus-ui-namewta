# Identity Access Web Domain

## Status
- `placeholder`: current login, registration, social callback, and access UI remain in the root App.
## Responsibilities
- Provide Vue login/register/social/session feedback, permission presentation adapters, and identity `WebDomainManifest` contributions.
## Non-responsibilities
- It does not own session/access business truth, App layout, Client selection, HTTP adapters, or backend authorization.
## Allowed dependencies
- Public identity-access domain, platform contracts/auth/permission, and selected web-kit entries.
## Forbidden dependencies
- Apps, other web-domain internals, concrete adapters, legacy root deep imports, and direct backend transport definitions.
## Public entrypoints
- Future `@namewta/web-domain-identity-access` root export for pages, UI adapters, messages, and `WebDomainManifest`.
## Backend modules
- `backendModules: [ruoyi-admin, ruoyi-system]`, inherited from identity authentication, session, and menu capabilities.
## Activation conditions
- Activate in T-06/T-07 with App-injected ClientContext/navigation/presenter and parity for every existing auth path.
## Validation
- Require component/manifest tests, Client fail-close and multi-Client Playwright matrices, dynamic-route/401 flows, lint, typecheck, and both App builds.
