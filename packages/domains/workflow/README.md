# Workflow Domain

## Status
- `placeholder`: workflow transport and models remain under root `src/api/workflow`.
## Responsibilities
- Own process category/definition/SpEL administration and task, instance, assignee, leave, and workflow-runtime application services.
## Non-responsibilities
- It does not render Process/UserSelect Vue components, administer system users, implement the workflow backend, or depend on a Router/UI runtime.
## Allowed dependencies
- Public platform contracts/http and the minimal `system-admin/public/user` query contract; later, matching api-contracts.
## Forbidden dependencies
- Apps, web-domains, web-kit, Vue/DOM, concrete adapters, system-admin implementation/deep imports, and reverse system-to-workflow edges.
## Public entrypoints
- Future `@namewta/domain-workflow` root exports for definition/runtime services, models, permissions, and `DomainModule` metadata.
## Backend modules
- `backendModules: [ruoyi-workflow, ruoyi-system]` for process capabilities and the explicitly consumed user-query source.
## Activation conditions
- Activate in T-08/T-09 after identity gates, first exposing definition then runtime slices through stable public exports.
## Validation
- Require definition/runtime unit and E2E paths, system-user port contract tests, no-cycle/headless import checks, lint, typecheck, and App builds.
