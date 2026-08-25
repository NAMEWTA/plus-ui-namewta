# Architecture Tooling

## Status
- `placeholder`: no architecture-check package or new dependency is active.
## Responsibilities
- Eventually enforce package dependency direction, cycles, public-entry-only imports, terminal purity, and selected Ratchet rules.
## Non-responsibilities
- It does not run in product runtime, redesign package boundaries, hide legacy findings globally, or replace behavior tests.
## Allowed dependencies
- Tooling-only graph/parser dependencies approved after baseline measurement and repository configuration contracts.
## Forbidden dependencies
- Product runtime imports, App/domain business code ownership, blanket ignores, and mutation of source during check mode.
## Public entrypoints
- Future check CLI/config entry for workspace scripts; no package or executable exists now.
## Backend modules
- `backendModules: []`; this tooling checks frontend architecture only.
## Activation conditions
- Activate in T-03 after measuring current imports and proving known-invalid fixtures fail without suppressing legacy state globally.
## Validation
- Require deterministic positive/negative fixtures, non-writing execution, local/CI command parity, manifest/lock review, and documented Ratchet scope.
