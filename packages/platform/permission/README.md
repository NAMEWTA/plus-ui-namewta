# Platform Permission

## Status
- `placeholder`: current permission helpers and stores remain the compatibility implementation.
## Responsibilities
- Define terminal-neutral AccessEvaluator semantics and platform-owned input value contracts for roles, permission strings, `*:*:*`, and the `superadmin` compatibility policy.
## Non-responsibilities
- It does not filter server-authorized menus, render buttons, register routes, replace backend authorization, or import identity-access/domain code; callers supply role and permission values.
## Allowed dependencies
- Public platform contracts only; permission input types consumed by the evaluator are defined by platform.
## Forbidden dependencies
- Every domain package, Apps, Vue directives, Router/Pinia singletons, Element Plus, DOM, and concrete adapters; platform must not reverse the `domains -> platform` direction.
## Public entrypoints
- Future `@namewta/platform-permission` root exports for AccessEvaluator and permission value contracts.
## Backend modules
- `backendModules: []`; identity-access/system-admin own traceability to authorization sources.
## Activation conditions
- Activate in T-07 after runtime evidence fixes the `superadmin`/legacy `admin` policy and current evaluator behavior is covered.
## Validation
- Run evaluator negative/positive unit matrices, button/route integration, architecture checks, typecheck, lint, and auth E2E.
