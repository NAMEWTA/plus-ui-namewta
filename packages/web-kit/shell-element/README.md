# Element Web Shell

## Status
- `placeholder`: the current root layout remains the active Web shell.
## Responsibilities
- Provide reusable Element Plus layout, navigation containers, global feedback surfaces, theme hooks, and Web startup shell contracts.
## Non-responsibilities
- It does not own domain pages/services, App-specific branding/composition, backend APIs, or authorization truth.
## Allowed dependencies
- Public platform Web-facing contracts, `ui-element`, `design-tokens`, Vue, Vue Router, and Element Plus after activation.
## Forbidden dependencies
- Domains, specific Apps, web-domain internals, backend transport, and concrete business adapters.
## Public entrypoints
- Future `@namewta/web-shell-element` root export for shell components, presenter adapters, and shell installation contracts.
## Backend modules
- `backendModules: []`; the shell has no backend capability ownership.
## Activation conditions
- Activate during identity/shell migration only after two Apps demonstrate shared mechanics with independent layout/theme overrides.
## Validation
- Require shell component/accessibility tests, presenter/navigation integration, no-domain-import architecture checks, lint, typecheck, and both App builds/E2E.
