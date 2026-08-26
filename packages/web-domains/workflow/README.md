# Workflow Web Domain

## Status

- Active for definition administration and T-09 workflow runtime.

## Responsibilities

- Own the complete category, process-definition, design, and SpEL administration behavior and exact server component-key registrations.
- Own task, instance, leave, approval and user-selection Vue behavior for the admin workflow manifest, including waiting/finished task separation, state-gated mutations, category filtering and exact urge/invalidation payloads.
- Load each actionable task and its backend button list before presenting delegate, transfer, add-sign, reduce-sign, termination, back, copy, attachment, next-node and completion controls; admin all-task rows remain view-only.
- Obtain confirmation, feedback, dictionaries, uploads/downloads, chart/designer URLs, attachment metadata, and tab navigation through explicit host runtime ports.

## Non-responsibilities

- Does not own App routing, transport implementation, system user administration, or server authorization.

## Allowed dependencies

- Workflow domain, app-runtime, Vue, Vue Router, and Element Plus public exports.

## Forbidden dependencies

- Root src, Apps, concrete adapters, other web-domain internals, and package deep imports.

## Public entrypoints

- The package root exports `createWorkflowWebDomain`, `WorkflowWebRuntime`, WorkflowUserSelect, the process-action dialog, and the approval/history/chart compatibility components.

## Backend modules

- backendModules: [ruoyi-workflow].

## Activation conditions

- Only Apps selecting workflowDomainModule and web-domain-workflow receive these registrations.

## Validation

- Unit tests lock manifest contributions, independent preselection/list limiting, scalar candidate filtering, leave-day calculation, admin intervention policy, and complete/back/operation payloads.
- `e2e/workflow-runtime.spec.ts` defines candidate-only browser coverage for real complete/back attachment uploads, candidate filtering, participant operations, admin intervention, instance variable updates, cancellation, invalidation, failure retention, and permission gates. Lead records the executed result in T-09 Evidence; source-worktree validation only lists these tests.

Root API/view/UserSelect/Process facades remain until T-15. Process facades adapt the legacy props, events, and exposed methods to this package; they do not retain a second implementation. TreePanel and host-only upload, chart, navigation, and attachment capabilities are injected; no root implementation is imported by this package.