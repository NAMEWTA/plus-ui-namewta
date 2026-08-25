# AI Domain

## Status
- `placeholder`: AI transport and models remain in the root App.
## Responsibilities
- Own AI agent/model request contracts, application services, conversation/stream lifecycle semantics, and domain-level failures.
## Non-responsibilities
- It does not render chat/agent Vue pages, own Web streaming UI state, provide model infrastructure, or expose prompts/tokens to logs.
## Allowed dependencies
- Public platform contracts/http and terminal-neutral streaming ports; later, matching api-contracts.
## Forbidden dependencies
- Apps, web-domains, web-kit, Vue/DOM, concrete browser adapters, and unrelated domains.
## Public entrypoints
- Future `@namewta/domain-ai` root exports for AI services, models, stream events, and `DomainModule` metadata.
## Backend modules
- `backendModules: [ruoyi-ai]` for AI agent and model-service HTTP capabilities.
## Activation conditions
- Activate in T-12 after platform/identity gates with real stream cancellation, retry, and error ownership specified.
## Validation
- Require headless import checks, request/stream lifecycle tests, secret/log review, lint, typecheck, manifest E2E, and dual-App build selection.
