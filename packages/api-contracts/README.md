# Generated API Contracts

## Status
- `placeholder`: OpenAPI generation is deferred to Wave 11; current hand-written transport types remain authoritative.
## Responsibilities
- Eventually contain reproducibly generated backend transport schema/types for domains to consume where appropriate.
## Non-responsibilities
- It does not define domain models/services, package boundaries, UI state, hand-written business rules, or generate code in this wave.
## Allowed dependencies
- Generated outputs may depend only on their documented generator runtime/types; domains may consume public generated entries after review.
## Forbidden dependencies
- Apps, web-domains, web-kit, concrete adapters, domain implementation code, and undocumented manual edits to generated output.
## Public entrypoints
- Future `@namewta/api-contracts` scoped exports defined by the OpenAPI generation contract; none exists now.
## Backend modules
- `backendModules: [ruoyi-admin, ruoyi-system, ruoyi-workflow, ruoyi-ai, ruoyi-demo, ruoyi-gen, ruoyi-job]` as candidate Springdoc sources, narrowed per generated surface.
## Activation conditions
- Activate only after hand-written domain boundaries stabilize and T-16 defines generator source, ownership, command, drift policy, and review.
## Validation
- Before activation, require README-only/no-manifest scans; after activation, require reproducible generation, zero unexplained drift, typecheck, and domain-model separation review.
