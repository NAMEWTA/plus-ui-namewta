# Workspace Generators

## Status
- `placeholder`: no frontend workspace/package generator is installed or executable.
## Responsibilities
- Eventually scaffold activated App/package contracts, names, exports, tests, and metadata consistently after boundaries are proven.
## Non-responsibilities
- It does not generate empty placeholder packages, implement backend `ruoyi-gen`, choose domain boundaries, or rewrite existing modules wholesale.
## Allowed dependencies
- Tooling-only template/parser dependencies and approved architecture metadata contracts.
## Forbidden dependencies
- Product runtime imports, silent overwrite of owned files, package activation without a Ticket, and backend generator implementation coupling.
## Public entrypoints
- Future explicit generator CLI with dry-run and collision behavior; no executable exists now.
## Backend modules
- `backendModules: []`; backend `ruoyi-gen` belongs to devtools capability and is not this tool's implementation dependency.
## Activation conditions
- Activate only after at least two manually verified packages establish stable layouts and generator ownership/overwrite rules are specified.
## Validation
- Require dry-run/golden fixtures, collision and rollback tests, generated diff review, architecture checks, and representative package gates.
