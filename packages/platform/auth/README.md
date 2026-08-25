# Platform Authentication

## Status
- `placeholder`: existing root session behavior remains authoritative.
## Responsibilities
- Define terminal-neutral session orchestration for ClientContext, login/logout, token expiry, recovery, and adapter-injected navigation/error presentation.
## Non-responsibilities
- It does not render login pages, own OAuth endpoint DTOs, select an App clientId, or perform service authorization.
## Allowed dependencies
- Public platform contracts/http/permission entries and identity-access public session inputs.
## Forbidden dependencies
- Apps, Vue/Router singletons, Element Plus, DOM/storage globals, concrete adapters, and unrelated domains.
## Public entrypoints
- Future `@namewta/platform-auth` root exports for SessionService and session lifecycle contracts.
## Backend modules
- `backendModules: []`; identity-access traces `/auth/**` and system session sources.
## Activation conditions
- Activate during T-04/T-07 only after login, Client fail-close, 401 singleton, and route recovery baselines remain green.
## Validation
- Require session unit tests, multi-Client and 401 Playwright matrices, architecture checks, typecheck, lint, and App builds.
