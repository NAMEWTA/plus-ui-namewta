# Architecture Tooling

## Status

- `active`: private workspace package `@namewta/architecture`.

## Responsibilities

- Discover only workspace directories that contain a real `package.json`.
- Enforce private package/public export contracts, `workspace:*` internal references, dependency direction, public-entry-only imports, cycle freedom, and inactive terminal boundaries.
- Compare exact current findings with `baseline.json`; new findings, stale entries, and baseline growth fail closed.
- Emit diagnostics containing rule, source, target, and repository-relative path.

## Non-responsibilities

- It does not run in product runtime, own App/domain behavior, rewrite manifests, mutate source, or replace behavior and browser tests.
- It is a conservative static import scanner rather than a TypeScript/Vue compiler or general task orchestrator.

## Allowed dependencies

- Node.js built-in modules and tooling-only catalog dependencies used by package scripts.

## Forbidden dependencies

- Product runtime packages, App/domain code, Nx, Turbo, microfrontend runtimes, public publishing configuration, blanket ignores, or environment-file readers.

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

- `baseline.json` is explicit, reviewed repository data. `maximumViolations` cannot be exceeded.
- `pnpm --filter @namewta/architecture exec node ./src/cli.mjs baseline --root ../..` prints measured findings for review; it never writes the baseline.
- Resolved entries must be removed. A broad path/rule ignore is not supported.

## Validation

- `pnpm architecture:check` validates the live workspace graph without writing files.
- `pnpm architecture:test` uses OS temporary directories to prove positive behavior and isolated failures for deep imports, reverse edges, cycles, baseline growth, and placeholder activation.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build:prod` preserve the root App quality gates. Playwright runs only in the Lead parent candidate.
