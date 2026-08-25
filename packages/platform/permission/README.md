# Platform Permission

## Status

- `active`: T-07 activates the terminal-neutral evaluator; root directives/plugins/utils remain compatibility facades until T-15.

## Responsibilities

- Define terminal-neutral AccessEvaluator semantics and platform-owned input value contracts for roles, permission strings, `*:*:*`, and the `superadmin` compatibility policy.

## Non-responsibilities

- It does not filter server-authorized menus, render buttons, register routes, replace backend authorization, or import identity-access/domain code; callers supply role and permission values.

## Allowed dependencies

- Public platform contracts only; permission input types consumed by the evaluator are defined by platform.

## Forbidden dependencies

- Every domain package, Apps, Vue directives, Router/Pinia singletons, Element Plus, DOM, and concrete adapters; platform must not reverse the `domains -> platform` direction.

## Public entrypoints

- `@namewta/platform-permission` exports `createAccessEvaluator`, `AccessEvaluator`, and the reviewed wildcard/superadmin constants.

## Backend modules

- `backendModules: []`; identity-access/system-admin own traceability to authorization sources.

## Activation conditions

- The canonical super role is `superadmin`. Existing root plugin/utils/directive behavior is runtime evidence for retaining `admin` as an explicit legacy alias during the compatibility window.

## Validation

- Unit matrices cover `superadmin`, the explicit `admin` alias, `*:*:*`, ordinary grants, empty requirements, and malformed fail-close snapshots; root gates and Lead E2E cover facade integration.