# Architecture Tooling

## Status

- `active`: private workspace package `@namewta/architecture`.

## Responsibilities

- Discover only workspace directories that contain a real `package.json`.
- Parse TypeScript/JavaScript imports with the TypeScript AST and Vue scripts with `@vue/compiler-sfc`; comments, templates, and string examples are not dependency edges.
- Enforce recognized package layouts, root/package privacy, required aggregate gate scripts, public exports, declared `workspace:*` internal references, the Spec dependency allowlist, terminal purity, public-entry-only imports, cross-workspace relative imports, cycle freedom, and README-only inactive terminal boundaries.
- Detect the reviewed browser/DOM/storage global set in platform/domain lexical scopes, including runtime and type references, direct host aliases, and `globalThis` itself, while ignoring declarations, property names, JSX attributes, comments, templates, and string examples.
- Parse `pnpm-workspace.yaml` and `pnpm-lock.yaml` as structured YAML, then validate exact workspace globs, required catalog families, active importers, dependency specifier parity, and stale importers.
- Compare exact current findings, including stable violation detail/specifier, with `baseline.json`; new findings, stale entries, and baseline growth fail closed.
- Emit diagnostics containing rule, source, target, and repository-relative path.

## Non-responsibilities

- It does not run in product runtime, own App/domain behavior, rewrite manifests, mutate source, or replace behavior and browser tests.
- It does not typecheck or bundle product code and is not a general task orchestrator; those remain workspace quality scripts.

## Allowed dependencies

- Node.js built-in modules plus direct catalog references to `typescript`, `@vue/compiler-sfc`, and `yaml`.

## Forbidden dependencies

- Product runtime imports, App/domain code ownership, regex-based import discovery, Nx, Turbo, microfrontend runtimes, public publishing configuration, blanket ignores, or environment-file readers.

## Public entrypoints

- Package API: `@namewta/architecture` exports `inspectWorkspace`, `createBaseline`, and `runArchitectureCheck` from `src/index.mjs`.
- CLI: `namewta-architecture check --root <workspace>` and `namewta-architecture baseline --root <workspace>`.
- Root commands: `pnpm architecture:check` and `pnpm architecture:test`.

## Backend modules

- `backendModules: []`; this package checks frontend repository architecture only.

## Activation conditions

- Active for the root application and every future App/package/tooling manifest matched by `pnpm-workspace.yaml`.
- `apps/mobile-web`, `apps/miniapp-taro`, `packages/adapters/taro-request`, and `packages/adapters/taro-storage` remain README-only until their dedicated activation tickets.

## Baseline contract

- `baseline.json` is explicit, reviewed repository data. Every identity contains `rule`, `source`, `target`, `path`, and stable `detail`; `maximumViolations` cannot be exceeded.
- `pnpm --filter @namewta/architecture exec node ./src/cli.mjs baseline --root ../..` prints measured findings for review; it never writes the baseline.
- Resolved entries must be removed. A broad path/rule ignore is not supported.

## Terminal browser global policy

- Host and navigation: `globalThis`, `window`, `self`, `document`, `navigator`, `location`, `history`, `screen`, and `visualViewport`.
- Storage and cache: `localStorage`, `sessionStorage`, `indexedDB`, `caches`, `cookieStore`, `Storage`, `IDBFactory`, and `CacheStorage`.
- DOM construction: `DOMParser`, `XMLSerializer`, `Node`, `Element`, `HTMLElement`, `Document`, `DocumentFragment`, `customElements`, and `CustomElementRegistry`.
- Observers: `MutationObserver`, `ResizeObserver`, `IntersectionObserver`, `PerformanceObserver`, and `ReportingObserver`.
- Network and workers: `XMLHttpRequest`, `WebSocket`, `EventSource`, `BroadcastChannel`, `fetch`, `Worker`, `SharedWorker`, and `ServiceWorker`.
- Rendering and media queries: `requestAnimationFrame`, `cancelAnimationFrame`, `matchMedia`, and `getComputedStyle`.
- An unshadowed `globalThis` reference fails by itself, including aliases and destructuring. Value and type declarations are tracked independently: a lexical value declaration or parameter shadows runtime references, a local type alias or interface shadows type references, and class/enum/namespace/value imports bind both namespaces. Type-only declarations do not shadow runtime globals, and unshadowed DOM type references such as `Document` fail terminal purity.

## Validation

- `pnpm architecture:check` validates the live workspace graph without writing files.
- `pnpm architecture:test` uses OS temporary directories to prove AST/SFC parsing, detail-sensitive baseline growth, direction and terminal purity, reviewed browser-global detection and lexical shadowing, deep/relative imports, inactive content, workspace/catalog drift, and lock importer parity.
- Root `build`, `build:dev`, `build:prod`, `lint`, `test`, and `typecheck` retain the root App command names; each aggregate workspace script runs the architecture check before its filter-capable package gate, so `--if-present` cannot silently skip an activated package with a missing script.
- Playwright runs only in the Lead parent candidate.