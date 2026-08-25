# AI Web Domain

## Status
- `placeholder`: AI pages and Web interaction state remain in the root App.
## Responsibilities
- Provide Vue agent/conversation views, stream presentation and cancellation UI, AI messages/styles, and manifest contributions.
## Non-responsibilities
- It does not own AI transport/business services, global shell, model infrastructure, or browser transport implementation.
## Allowed dependencies
- Public AI domain, platform streaming/error contracts, and selected web-kit entries.
## Forbidden dependencies
- Apps, other web-domain internals, concrete adapters, direct globals for domain behavior, and secret-bearing logs.
## Public entrypoints
- Future `@namewta/web-domain-ai` root export for AI views/composables/messages and `WebDomainManifest`.
## Backend modules
- `backendModules: [ruoyi-ai]`, inherited from AI agent and model-service capabilities.
## Activation conditions
- Activate in T-12 with terminal-neutral stream ownership in the domain/platform layer and explicit App selection.
## Validation
- Require stream loading/cancel/retry UI tests, manifest selected-only checks, secret review, lint, typecheck, E2E, and admin/client build comparison.
