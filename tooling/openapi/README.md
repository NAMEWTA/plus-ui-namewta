# OpenAPI Tooling

## Status
- `placeholder`: no generator, schema snapshot, dependency, or command is active before Wave 11.
## Responsibilities
- Eventually fetch/freeze approved Springdoc input and reproducibly generate scoped transport contracts with drift diagnostics.
## Non-responsibilities
- It does not define domains, replace domain models, generate UI/application services, or block earlier hand-written migrations.
## Allowed dependencies
- Tooling-only OpenAPI parser/generator dependencies and documented backend schema inputs approved in T-16.
## Forbidden dependencies
- Product runtime imports, undocumented network fetches in check mode, manual generated-output edits, and transport schema deciding domain boundaries.
## Public entrypoints
- Future generate/check CLI commands and schema-source configuration; no executable exists now.
## Backend modules
- `backendModules: [ruoyi-admin, ruoyi-system, ruoyi-workflow, ruoyi-ai, ruoyi-demo, ruoyi-gen, ruoyi-job]` as candidate Springdoc sources, explicitly scoped at activation.
## Activation conditions
- Activate in T-16 after domains stabilize and source URL/artifact, authentication, versioning, owner, offline behavior, and drift policy are approved.
## Validation
- Before activation, require README-only/no-manifest scans; after activation, require reproducible generation, offline/check behavior, zero unexplained diff, and typecheck.
