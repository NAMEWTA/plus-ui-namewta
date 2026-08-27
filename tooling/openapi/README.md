# OpenAPI Tooling

Deterministic, package-local commands for the private `@namewta/api-contracts` boundary.

- `openapi:fetch -- --source <url-or-file> --backend-commit <40-character-sha>` validates OpenAPI 3.0/3.1 input, persists snapshot and provenance in an immutable bundle-digest revision, then atomically activates that revision through `current.json`.
- `openapi:generate` validates the active revision provenance and generates TypeScript offline from its committed snapshot.
- `openapi:check` validates the active revision, compares an in-memory generation with the committed output, and never writes.

The generator runs with its supported package-local TypeScript 5.9.3 peer. The generated contract remains consumed and typechecked by the workspace TypeScript 6 toolchain.

The test suite proves invalid or unreachable sources preserve the last-known-good pointer, an unactivated revision cannot affect generation, stale provenance and source drift are detected, regeneration closes intentional drift, mixed-case HTTP source errors redact URL credentials/query values, and manual generated-file edits fail the check.
