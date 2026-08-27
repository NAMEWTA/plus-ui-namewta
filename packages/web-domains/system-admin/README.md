# System Administration Web Domain

## Status

- `active`: T-10 provides governance pages; T-11 adds dictionary, configuration, notice, OSS, and OSS-configuration pages.

## Responsibilities

- Provide Vue administration pages, local components/composables, and manifest entries for governance and resource/content slices.
- Consume editor, image preview, dictionary cache, OSS download, and HTML sanitization only through typed host runtime ports.

## Non-responsibilities

- It does not own system application services, global shell/layout, current-session authentication, workflow UI, or backend authorization.
- The current-session profile remains a host-owned static route. Message-box and social-binding transports have no standalone backend menu page and therefore remain domain services rather than invented registrations.

## Allowed dependencies

- Public system-admin domain, platform app-runtime, Vue, Vue Router, and Element Plus.

## Forbidden dependencies

- Apps, other web-domain internals, concrete adapters, domain deep imports, and root compatibility internals after facade removal.

## Public entrypoints

- `@namewta/web-domain-system-admin` exports the typed host runtime contract and `createSystemAdminWebDomain` manifest factory; `@namewta/web-domain-system-admin/pages` is the compatibility-safe page component entrypoint.

## Backend modules

- `backendModules: [ruoyi-system]`, including existing `/system/**` and `/resource/**` administration controllers.

## Activation conditions

- An App must explicitly select both `system-admin` and `web-domain-system-admin`; admin-web does so and client-web does not.

## Validation

- Require exact component-key/permission manifest tests, selected-only registration, resource transport/security tests, settled resource loading states, lint, typecheck, architecture checks, and Lead-run browser evidence for real OSS controls, message consumption, and legacy profile social seams. T-15 retired the legacy root API/view facades after consumer scans passed.
