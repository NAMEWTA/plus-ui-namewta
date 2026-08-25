# Platform Contracts

## Status
- `placeholder`: no platform contract package or exports exist.
## Responsibilities
- Define terminal-neutral ports such as HttpClient, TokenStorage, ClientContext, ErrorPresenter, NavigationPort, and stable error/result shapes.
## Non-responsibilities
- It does not implement Axios, storage, crypto, UI feedback, navigation, authentication workflows, or business domains.
## Allowed dependencies
- Type-only standard-library primitives and deliberately approved transport-neutral contract types.
## Forbidden dependencies
- Domains, Apps, Vue, Vue Router, Element Plus, DOM globals, Axios, Taro, and concrete adapters.
## Public entrypoints
- Future `@namewta/platform-contracts` root exports for stable port types only.
## Backend modules
- `backendModules: []`; contracts are frontend runtime boundaries, not a backend capability domain.
## Activation conditions
- Activate with T-04 only when real browser adapter consumers and contract tests prove each port has a concrete need.
## Validation
- Enforce no framework/runtime imports, public-root-only consumption, typecheck, unit contract tests, and architecture checks.
