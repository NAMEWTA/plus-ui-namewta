# Web Design Tokens

## Status

- `active`: T-06 activates the minimal semantic palette used by both the client shell and identity login surface.

## Responsibilities

- Publish framework-light client accent, canvas, surface, line, text, radius, and elevation primitives with CSS and typed read-only entrypoints.

## Non-responsibilities

- It does not impose an admin brand, render components, own domain styles/layout, or access runtime/backend capabilities.

## Allowed dependencies

- Static CSS and TypeScript data primitives only.

## Forbidden dependencies

- Domains, Apps, web-domains, Vue/Element components, runtime adapters, DOM access, and backend modules.

## Public entrypoints

- `@namewta/design-tokens` exports frozen token data; `@namewta/design-tokens/client-theme.css` exports the client CSS custom properties.

## Backend modules

- `backendModules: []`; tokens are presentation-only.

## Activation conditions

- Changes require at least the shell and a real page surface to consume semantic tokens without embedding App/domain behavior.

## Validation

- Token unit tests, architecture checks, scoped lint/typecheck, client build, and Lead dual-App visual assertions guard the public values and override boundary.