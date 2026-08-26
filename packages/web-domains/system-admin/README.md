# System Administration Web Domain

## Status

- `active`: T-10 provides the Client, user, user-type, role, menu, department, and post administration pages.

## Responsibilities

- Provide Vue administration pages, local components/composables, and manifest entries for the seven active governance slices.

## Non-responsibilities

- It does not own system application services, global shell/layout, current-session authentication, workflow UI, or backend authorization.
- The current-session profile remains a host-owned static route; configuration, content, OSS, messages, and social-resource pages remain reserved for T-11.

## Allowed dependencies

- Public system-admin domain, platform app-runtime, Vue, Vue Router, and Element Plus.

## Forbidden dependencies

- Apps, other web-domain internals, concrete adapters, domain deep imports, and root compatibility internals after facade removal.

## Public entrypoints

- `@namewta/web-domain-system-admin` exports the typed host runtime contract and `createSystemAdminWebDomain` manifest factory; `@namewta/web-domain-system-admin/pages` is the compatibility-safe page component entrypoint.

## Backend modules

- `backendModules: [ruoyi-system]`, inherited from the seven active governance capabilities.

## Activation conditions

- An App must explicitly select both `system-admin` and `web-domain-system-admin`; admin-web does so and client-web does not.

## Validation

- Require page/manifest governance paths, permission and Client failure cases, selected-only registration, lint, typecheck, architecture checks, and dual-App builds.