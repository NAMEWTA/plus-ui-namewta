# Client Web Application

## Status

- `active`: `@namewta/client-web` is the T-06 second-App proof with its own Vite build, preview, ClientContext, session namespace, shell, theme, and explicit composition.

## Responsibilities

- Compose only identity-access and demo public manifests, create browser adapters, own base-aware client routing and stable registry diagnostics, install the minimal demo toolbar/pagination/icon hosts, and produce an independently deployable client bundle.

## Non-responsibilities

- It is not an admin clone and does not own reusable identity/demo rules, full authorization recovery, system administration, workflow, AI, devtools, or operations. Until T-07 installs shared access evaluation, migrated demo `v-hasPermi` controls are removed fail-closed; this is a temporary T-06 proof boundary, not final permission semantics, and never grants backend authority.

## Allowed dependencies

- Public exports of selected identity/demo domains and web-domains, platform contracts/app-runtime, browser axios/storage/crypto adapters, Vue/Router/Element Plus, and the activated shell/design tokens.

## Forbidden dependencies

- Root `src/**`, admin internals, unselected domains, package deep imports, a fallback/default Client, and the `Admin-Token` storage key.

## Public entrypoints

- `src/main.ts` is the browser entry; `src/composition.ts` owns the compile-time selection; package scripts expose `build`, `preview`, `lint`, `test`, and `typecheck`.

## Backend modules

- `backendModules: [ruoyi-admin, ruoyi-system, ruoyi-demo]` through `/auth/client/context`, `/auth/code`, `/auth/login`, and selected demo APIs.

## Activation conditions

- Deployment must inject a non-empty OAuth `VITE_CLIENT_WEB_CLIENT_ID` mapped to the selected server capabilities. The committed proof Client and disabled request encryption are public test configuration, not a production credential or a change to admin encryption.

## Validation

- Source owner runs `pnpm --filter @namewta/client-web test`, `typecheck`, and `build`; source must not run Playwright. Lead builds root admin and client, starts admin preview on `4173` and `pnpm --filter @namewta/client-web preview` on `4174`, then runs `CLIENT_WEB_URL=http://127.0.0.1:4174 ADMIN_WEB_URL=http://127.0.0.1:4173 pnpm exec playwright test e2e/client-web-proof.spec.ts`. The proof exercises captcha refresh, demo toolbar/pagination behavior, Router-owned brand navigation, and the T-06 fail-closed permission boundary; T-07 still owns final shared permission/router integration.