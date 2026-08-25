# Multi-App Architecture Migration Baseline

This document freezes the observable admin application behavior before the multi-app domain migration. It is a
characterization baseline, not a description of the target package architecture.

## Behavior invariants

### Client authentication

- The login page calls `/auth/client/context` before enabling login, registration, or social login actions.
- `clientEnabled` and `registerEnabled` must be exact JSON Booleans. Missing or malformed values fail closed and do not
  trigger captcha, login, or registration requests. The browser baseline covers both request failure and a response
  missing `registerEnabled`; each scenario waits for the terminal `客户端认证配置不可用，无法登录` message, verifies
  exactly one Client context request, and only then checks that authentication controls remain disabled and no later
  authentication endpoint was called.
- Before transport encryption, the login adapter supplies `e5cd7e4891bf95d1d19206ce24a7b32e` as body `clientId`
  and marks the request `isEncrypt: true`. The browser baseline independently requires the same `clientid` header plus
  a nonempty `encrypt-key` and a nonempty request body that does not expose `clientId` or its value in plaintext.
- The existing `e2e/client-auth-context.spec.ts` covers malformed and valid Client context responses. The new
  `e2e/multi-app-baseline.spec.ts` adds a backend-free login and session restoration path.

### Dynamic routes

- Session restoration follows `getInfo -> getRouters -> addRoute -> replace` in the browser guard. The browser baseline
  starts with `/login?redirect=%2Fbaseline%2Froute`, records the strict `login -> getInfo -> getRouters` request order,
  and requires the redirected page content to render after dynamic route registration and replacement.
- `/system/menu/getRouters` is already filtered by the server for the authenticated Client. The permission store maps
  every returned menu and does not apply a second Client or permission filter to those server routes.
- `Layout`, `ParentView`, and `InnerLink` use their fixed Web components. Other component keys resolve through the
  current `src/views/**/*.vue` lookup and preserve the route name for keep-alive behavior.
- `filterDynamicRoutes` applies permission or role evaluation only to the separate local `dynamicRoutes` extension.
  A local route without `permissions` or `roles` is not added.

### HTTP 401 handling

- Every 401 response rejects with the existing invalid-session result.
- `isRelogin.show` allows only one confirmation prompt while concurrent 401 responses are pending.
- Confirming the prompt resets the singleton flag, logs out, and replaces the current route with `/login`. The query
  contains `encodeURIComponent(router.currentRoute.value.fullPath || '/')` as `redirect`.
- Cancelling the prompt resets the singleton flag without logout or navigation.

### Mock API completeness

- Browser tests collect every unrecognized `/prod-api/**` request and require the collection to remain empty. The
  fallback response keeps diagnostics deterministic but cannot silently turn a newly introduced dependency green.

## Source-worktree results

Working directory: the T-01 `plus-ui-namewta` source worktree at base
`0bf978670e7915490fc85208946e0d022dedf55e`. Commands were run on 2026-08-25.

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm install --frozen-lockfile` | 0 | Lockfile was up to date; 362 packages were installed from the existing lockfile. |
| `pnpm exec vitest run src/store/modules/permission.test.ts src/utils/request.test.ts` | 0 | 2 files and 5 tests passed, including the pre-encryption login configuration seam. |
| `pnpm test` | 0 | 4 files and 11 tests passed. |
| `pnpm lint` | 0 | Oxlint completed without diagnostics. |
| `pnpm typecheck` | 0 | Final `vue-tsc --noEmit` run completed without diagnostics. |
| `pnpm exec tsc --ignoreConfig --noEmit --module ESNext --moduleResolution Bundler --target ESNext --types node,@playwright/test --skipLibCheck e2e/multi-app-baseline.spec.ts` | 0 | Supplemental E2E source typecheck completed without diagnostics; no browser or web server was started. |
| `pnpm build:prod` | 0 | Latest run transformed 3364 modules and reported `built in 2.59s`; gzip output generation completed. |
| `pnpm test:e2e` | not run | Required in the Lead-owned parent-candidate; source worktrees must not run Playwright. |

The first targeted Vitest run failed because the test cleared the interceptor registration record. The fixture was
repaired to retain the response handler registered at module import. The next run exposed that Element Plus auto-imports
resolve through `element-plus/es`; mocking that UI module instead of browser globals repaired the fixture. The first
typecheck run exited 2 because four test route fixtures did not satisfy Vue Router 5's `RouteRecordRaw`; adding explicit
dummy components repaired the fixtures. Both checks were rerun successfully. No production source, manifest, lockfile,
or generated declaration was changed.

The first supplemental E2E source typecheck omitted TypeScript 6's required `--ignoreConfig` option and exited 1 with
`TS5112` before checking the file. The corrected command shown above exited 0. This static check is additional evidence,
not a replacement for the Lead-owned Playwright run.

The latest production build reported `dist/index.html` at 115.31 kB (50.80 kB gzip), its largest JavaScript chunk at
1382.40 kB (435.47 kB gzip), and the main CSS chunk at 992.19 kB (155.77 kB gzip). Hashed file names and elapsed time
are diagnostic observations, not fixed pass thresholds.

## Gate reuse

For Gate A, the Lead must apply the T-01 commit to a candidate based on the current parent, rerun `pnpm test`,
`pnpm lint`, `pnpm typecheck`, and `pnpm build:prod`, then run `pnpm test:e2e`. The Playwright suite must include both
`client-auth-context.spec.ts` and `multi-app-baseline.spec.ts`. The latter contains four scenarios: Client context
request failure, required-field failure, login plus redirected dynamic route restoration, and authenticated 401 logout.

Later migration Gates should rerun the permission and request tests whenever route assembly, Client/session handling,
the request adapter, Router, or user/permission Stores change. The browser baseline should be rerun whenever an App
entry, login UI, Client configuration, dynamic component registry, Web shell, or 401 presenter changes. A failed Gate
does not justify deleting the legacy entry or weakening these assertions.

## Baseline limitations

- Unit tests mock only runtime boundaries: the menu HTTP adapter, Router registration, auth evaluator, user Store,
  Element Plus presenter, and axios transport. They do not prove the backend's Client filtering implementation.
- Playwright uses local route fixtures and synthetic credentials/token values. It proves browser orchestration without
  real secrets or a live backend, but it does not prove a deployed Client/RBAC configuration.
- Source-worktree Playwright is intentionally unverified until the Lead runs it in the parent-candidate.
- The current component lookup returns `undefined` for an unknown server component key. T-01 records that existing
  limitation and does not claim the later explicit manifest diagnostic already exists.
- Current redirect encoding is characterized exactly as implemented. The tests do not claim that every external
  consumer performs only one URL encoding pass.
