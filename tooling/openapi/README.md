# OpenAPI Tooling

Deterministic, package-local commands for the private `@namewta/api-contracts` boundary.

- `openapi:fetch -- --source <url-or-file>` validates OpenAPI 3.0/3.1 input before atomic snapshot replacement.
- `openapi:generate` generates TypeScript offline from the committed snapshot.
- `openapi:check` compares an in-memory generation with the committed output and never writes.

The test suite proves invalid or unreachable sources preserve the last-known-good snapshot, source drift is detected, regeneration closes intentional drift, and manual generated-file edits fail the check.