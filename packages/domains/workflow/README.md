# Workflow Domain

## Status

- Active in T-08 as the headless workflow definition-administration domain.

## Responsibilities

- Own category, process-definition, design transport, and SpEL models/services plus domain metadata.

## Non-responsibilities

- Does not own task/instance/leave runtime, Vue pages, browser state, routing, or concrete HTTP adapters.

## Allowed dependencies

- Platform contracts and app-runtime public exports through an injected HttpClient.

## Forbidden dependencies

- Vue, DOM/browser globals, concrete adapters, Apps, root src, and package deep imports.

## Public entrypoints

- The package root exports models, WorkflowDefinitionService, its factory, and workflowDomainModule.

## Backend modules

- backendModules: [ruoyi-workflow].

## Activation conditions

- An App selects the workflow domain and injects its own HttpClient.

## Validation

- Exhaustive transport tests lock 24 category/definition/SpEL calls, architecture checks, lint, typecheck, and builds.

## Compatibility

Mutation methods intentionally retain existing PUT/DELETE contracts under DEV-T08-002. legacyDefinitionXml retains the
old frontend path although the current backend has no matching controller and no production caller. Both compatibility
contracts expire only after a coordinated backend migration and legacy-facade removal at or after T-15.