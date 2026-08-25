# Workflow Web Domain

## Status
- `placeholder`: workflow pages and Process-related components remain in the root compatibility source.
## Responsibilities
- Provide Vue definition/task/instance/leave pages, Process and assignee UI, workflow composables/messages, and manifest component-key mappings.
## Non-responsibilities
- It does not own workflow services/models, system user administration, App shell, or backend process execution.
## Allowed dependencies
- Public workflow domain, approved system-admin public user UI contracts where necessary, platform runtime, and selected web-kit entries.
## Forbidden dependencies
- Apps, system-admin implementation pages, other web-domain deep imports, concrete adapters, and direct backend transport internals.
## Public entrypoints
- Future `@namewta/web-domain-workflow` root export for workflow views/components/messages and `WebDomainManifest`.
## Backend modules
- `backendModules: [ruoyi-workflow, ruoyi-system]`, matching process behavior and explicit user-query integration.
## Activation conditions
- Activate through T-08/T-09 after the domain and user public seam exist; component ownership must be proven by real consumers.
## Validation
- Require definition/runtime/assignee E2E, manifest key and keep-alive tests, no-cycle/deep-import checks, lint, typecheck, and App builds.
