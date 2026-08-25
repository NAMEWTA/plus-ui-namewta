# System Administration Domain

## Status
- `placeholder`: system management APIs and models remain under root `src/api/system`.
## Responsibilities
- Own Client/user/user-type/role/menu/department/post governance plus dictionary, configuration, notice, OSS, message, and social-resource application services.
## Non-responsibilities
- It does not own current-session authentication, global route guards, Vue administration pages, workflow rules, or code-generator behavior.
## Allowed dependencies
- Public platform contracts/http and explicit transport contracts; expose minimal user, dictionary, and menu ports to authorized peer domains.
## Forbidden dependencies
- Apps, web-domains, web-kit, Vue/DOM, concrete adapters, workflow/devtools implementations, and cyclic same-layer imports.
## Public entrypoints
- Future `@namewta/domain-system-admin` root plus explicit `public/user`, `public/dict`, and `public/menu` exports.
## Backend modules
- `backendModules: [ruoyi-system]` for governance, configuration, content, resource, message, and social administration endpoints.
## Activation conditions
- Activate in T-09 through T-11 as vertical slices, preserving public seams and legacy facades until the admin entry migration.
## Validation
- Require domain/API tests, public-seam contract tests, no-cycle/deep-import checks, OSS/security regressions, lint, typecheck, and dual-App builds.
