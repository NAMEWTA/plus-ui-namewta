# Application Placeholders

## Status
- `placeholder`: this directory is not a workspace member and contains no buildable application.
## Responsibilities
- Index the future independently built delivery units and their composition boundaries.
## Non-responsibilities
- It does not own reusable domain rules, runtime adapters, or shared Web UI.
## Allowed dependencies
- Activated child Apps may consume selected public entries from `packages/**`.
## Forbidden dependencies
- Child Apps must not import another App or deep-import package internals.
## Public entrypoints
- None while placeholder; each activated App will own its entry and composition manifest.
## Backend modules
- `backendModules: []`; backend traceability belongs to each App's selected domains.
## Activation conditions
- Activate a child only through its migration Ticket with an independent ClientContext, build, and deployment contract.
## Validation
- Confirm this tree contains README files only until individual Apps are activated and is absent from workspace package discovery.
