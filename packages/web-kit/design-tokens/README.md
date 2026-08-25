# Design Tokens

## Status
- `placeholder`: current styles remain App/root-owned and no token package exists.
## Responsibilities
- Provide framework-light shared color, spacing, typography, elevation, and semantic token contracts that Apps may override.
## Non-responsibilities
- It does not impose one brand/theme, contain Vue components, own domain styles, or encode App layout.
## Allowed dependencies
- Static CSS/data primitives and documented token-generation inputs approved at activation.
## Forbidden dependencies
- Domains, Apps, web-domains, Element components, runtime adapters, and backend modules.
## Public entrypoints
- Future `@namewta/design-tokens` exported token data/style entrypoints defined by the activation Ticket.
## Backend modules
- `backendModules: []`; design tokens are presentation-only.
## Activation conditions
- Activate only when admin-web and client-web identify a genuinely shared token set with explicit override behavior.
## Validation
- Require token schema/snapshot review, App override and visual regression evidence, architecture checks, lint/typecheck where applicable, and both Web builds.
