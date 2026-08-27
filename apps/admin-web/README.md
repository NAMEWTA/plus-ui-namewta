# Admin Web Application

## Status

- `active`: this package owns the production admin browser entry and explicitly composes all selected capabilities.

## Responsibilities

- Own the admin ClientContext, browser bootstrap, shell, router/store adapters, layout, theme, static assets and deployment configuration.
- Compose identity-access, system-admin, workflow, AI, demo, devtools and operations through their public domain/web-domain entries.

## Non-responsibilities

- Reusable domain services, shared adapter implementations, backend authorization and terminal-neutral business models remain outside this App.

## Allowed dependencies

- Public entries of selected platform, domain, web-domain, web-kit and browser-adapter packages.
- App-local shell components, views, stores, browser plugins and presentation assets.

## Forbidden dependencies

- Other Apps, package internals/deep imports, Taro adapters, backend implementation modules and the retired root `src/` entry.

## Public entrypoints

- `src/main.ts` is the browser entry.
- `src/router/adminManifestRegistry.ts` is the compile-time capability composition boundary.
- Package scripts expose independent `build`, `build:dev`, `build:prod`, `dev`, `preview`, `lint`, `test` and `typecheck` gates.

## Backend modules

- `backendModules: [ruoyi-admin, ruoyi-system, ruoyi-workflow, ruoyi-ai, ruoyi-demo, ruoyi-gen, ruoyi-job]` are reached only through selected domain contracts.

## Activation conditions

- The App is activated by T15 after every domain Gate through G6 is integrated.
- The root compatibility entry may be removed only after this package passes its pre-contract architecture, lint, typecheck, unit and production build checks.

## Validation

- Run frozen install, workspace/architecture checks, independent admin lint/typecheck/unit/build, both App builds and Lead-owned full Playwright.
- Gate H also requires the root `src/` path and retired root App entry/config/static files to be absent after the contract commit.
