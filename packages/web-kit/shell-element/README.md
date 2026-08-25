# Element Web Shell

## Status

- `active-minimal`: T-06 activates a reusable Element Plus container for client branding, navigation, App Client context, and content slots; admin migration remains later work.

## Responsibilities

- Provide accessible brand/navigation landmarks with App-owned navigation, stable shell data markers, Client context display, App-owned slot/layout hooks, and the minimal reusable toolbar/pagination hosts required by migrated table pages.

## Non-responsibilities

- It does not choose domains, resolve routes, own authentication, call backend APIs, define App branding, or authorize navigation.

## Allowed dependencies

- Vue, Element Plus, and public design-token primitives.

## Forbidden dependencies

- Domains, Apps, web-domain internals, backend transport, concrete adapters, and Router/Store singletons.

## Public entrypoints

- `@namewta/web-shell-element` exports `ClientWebShell`, `ClientRightToolbar`, `ClientPagination`, and their typed navigation/pagination contracts.

## Backend modules

- `backendModules: []`; the shell owns no backend capability.

## Activation conditions

- App consumers must supply a Router-derived brand href/callback, branding, Client label, navigation callbacks, and content; reusable mechanics must stay independent of a specific App or domain.

## Validation

- Public component tests, architecture/lint/typecheck gates, client build, and Lead dual-preview E2E verify base-safe brand navigation, actionable toolbar/pagination hosts, shell identity, accessibility landmarks, and theme distinction.