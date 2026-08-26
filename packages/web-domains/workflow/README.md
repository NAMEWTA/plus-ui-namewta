# Workflow Web Domain

## Status

- Active for definition administration and T-09 workflow runtime.

## Responsibilities

- Own the complete category, process-definition, design, and SpEL administration behavior and exact server component-key registrations.
- Own task, instance, leave, approval and user-selection Vue behavior for the admin workflow manifest.
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

- Manifest tests cover selected/unselected composition, duplicate keys, all exact definition/runtime component names, permissions, designer behavior, user failure handling, typecheck, and App builds.

Root API/view/UserSelect facades remain until T-15. TreePanel stays an injected shared host component because system pages also consume its exact behavior.