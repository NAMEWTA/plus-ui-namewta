# OpenAPI Tooling

Deterministic, package-local commands for the private `@namewta/api-contracts` boundary.

- `openapi:fetch -- --source <url-or-file> --backend-commit <40-character-sha>` validates OpenAPI 3.0/3.1 input before transactionally replacing the snapshot and machine provenance.
- `openapi:generate` validates provenance and generates TypeScript offline from the committed snapshot.
- `openapi:check` validates provenance, compares an in-memory generation with the committed output, and never writes.

The generator runs with its supported package-local TypeScript 5.9.3 peer. The generated contract remains consumed and typechecked by the workspace TypeScript 6 toolchain.

The test suite proves invalid or unreachable sources preserve the last-known-good snapshot and provenance, stale provenance and source drift are detected, regeneration closes intentional drift, source errors redact URL credentials/query values, and manual generated-file edits fail the check.