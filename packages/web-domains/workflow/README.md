# Workflow Web Domain

## Status

- Active in T-08 for definition administration.

## Responsibilities

- Own the complete category, process-definition, design, and SpEL administration behavior and exact server component-key registrations.
- Obtain confirmation, feedback, dictionaries, downloads, designer URLs, and tab navigation through explicit host runtime ports.

## Non-responsibilities

- Does not own task, instance, leave, Process components, App routing, or transport implementation.

## Allowed dependencies

- Workflow domain, app-runtime, Vue, Vue Router, and Element Plus public exports.

## Forbidden dependencies

- Root src, Apps, concrete adapters, other web-domain internals, and package deep imports.

## Public entrypoints

- The package root exports `createWorkflowWebDomain` and `WorkflowWebRuntime`.

## Backend modules

- backendModules: [ruoyi-workflow].

## Activation conditions

- Only Apps selecting workflowDomainModule and web-domain-workflow receive these registrations.

## Validation

- Manifest tests cover selected/unselected composition, duplicate keys, exact component names, query/action permissions, designer query/close behavior, typecheck, and App builds.

Root view facades remain until T-15. The definition-admin slice does not claim ownership of T-09 runtime pages.