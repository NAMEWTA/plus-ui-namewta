# AI Web Domain

## Status
- `active`: `@namewta/web-domain-ai` owns the Snail AI iframe page, lifecycle, and explicit manifest.
## Responsibilities
- Provide the Vue iframe page, registration/loading/error/retry lifecycle, same-origin HTML probe, AI messages/styles, and manifest contribution.
## Non-responsibilities
- It does not own AI transport, global shell, model infrastructure, or invent postMessage/SSE/ReadableStream/backend protocols.
## Allowed dependencies
- Public AI domain, platform app-runtime, Vue, and Element Plus.
## Forbidden dependencies
- Apps, other web-domain internals, concrete adapters, direct globals for domain behavior, and secret-bearing logs.
## Public entrypoints
- `@namewta/web-domain-ai` exports the typed runtime, lazy page loader, and `createAiWebDomain`; `./pages` exports the compatibility-safe page.
## Backend modules
- `backendModules: [ruoyi-ai]`, inherited from the current-user registration capability.
## Activation conditions
- Activated in T-12 only when an App explicitly selects `ai` and `web-domain-ai`; admin does so and client does not.
## Validation
- Require registration, probe failure, iframe load timeout, retry, credential URL cleanup, selected-only checks, secret review, lint, typecheck, E2E, and dual-App builds.
