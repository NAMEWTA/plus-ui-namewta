# Workflow Web Domain

## Status

- Active for definition administration and T-09 workflow runtime.

## Responsibilities

- Own the complete category, process-definition, design, and SpEL administration behavior and exact server component-key registrations.
- Own task, instance, leave, approval and user-selection Vue behavior for the admin workflow manifest, including waiting/finished task separation, state-gated mutations, category filtering and exact urge/invalidation payloads.
- Obtain confirmation, feedback, dictionaries, downloads, designer URLs, and tab navigation through explicit host runtime ports.

## Non-responsibilities

- Does not own App routing, transport implementation, system user administration, or server authorization.

## Allowed dependencies

- Workflow domain, app-runtime, Vue, Vue Router, and Element Plus public exports.

## Forbidden dependencies

- Root src, Apps, concrete adapters, other web-domain internals, and package deep imports.

## Public entrypoints

- The package root exports `createWorkflowWebDomain`, `WorkflowWebRuntime`, and the compatibility-safe WorkflowUserSelect.

## Backend modules

- backendModules: [ruoyi-workflow].

## Activation conditions

- Only Apps selecting workflowDomainModule and web-domain-workflow receive these registrations.

## Validation

- Manifest and focused runtime tests cover selected/unselected composition, duplicate keys, exact component names and permissions, user preselection/pagination retention, fail-close state rules, exact action payloads, user failure handling, typecheck, and App builds.

Root API/view/UserSelect facades remain until T-15. The compatibility UserSelect forwards data/modelValue/userIds/multiple and open/close. TreePanel stays an injected shared host component and is used by definition, instance, and current-document pages; no root implementation is imported by this package.