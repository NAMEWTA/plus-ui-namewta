# Workflow Domain

## Status

- Active for workflow definition administration and T-09 task/instance/leave runtime.

## Responsibilities

- Own category, definition, SpEL, task, instance and leave transport models/services plus domain metadata, including exact task-operation, termination and three-field urge contracts.
- Consume the minimal `@namewta/domain-system-admin/public/user` query port; no system implementation or private user model crosses the boundary.

## Non-responsibilities

- Does not own Vue pages, browser state, routing, concrete HTTP adapters, or system user administration.

## Allowed dependencies

- Platform contracts, app-runtime, and the system-admin public user seam through an injected HttpClient.

## Forbidden dependencies

- Vue, DOM/browser globals, concrete adapters, Apps, root src, and package deep imports.

## Public entrypoints

- The package root exports all workflow runtime models, WorkflowDefinitionService, its factory, user seam types, and workflowDomainModule.

## Backend modules

- backendModules: [ruoyi-workflow].

## Activation conditions

- An App selects the workflow domain and injects its own HttpClient.

## Validation

- Exhaustive transport tests lock definition and runtime methods/paths/encoding, project current-task users to UserSummary, and prove user failures propagate; architecture checks prove the headless dependency boundary.

## Compatibility

Mutation methods intentionally retain existing PUT/DELETE contracts under DEV-T08-002. legacyDefinitionXml retains the
old frontend path although the current backend has no matching controller and no production caller. Both compatibility
contracts expire only after a coordinated backend migration and legacy-facade removal at or after T-15.