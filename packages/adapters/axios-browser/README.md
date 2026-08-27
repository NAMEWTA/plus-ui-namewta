# Axios Browser Adapter

## Status

- `active`: `@namewta/adapter-axios-browser` is composed by the admin-web and client-web application entries.

## Responsibilities

- Implement platform HttpClient for browsers using Axios, including headers, encryption fail-close, downloads, repeat-submit, request timeout, and structured failures with sanitized causes. Only a response `encrypt-key` identifies an encrypted response; encrypted requests remain compatible with plaintext JSON responses. A response key without a CryptoPort or a valid decryptable payload fails closed, and key-marked binary responses are rejected without exposing their payload. The admin-web adapter opts into the legacy 401 string rejection.

## Non-responsibilities

- It does not own endpoint DTOs, session/domain workflows, UI messages, Router navigation, or service authorization.

## Allowed dependencies

- Public platform contracts/http/auth ports, Axios, and narrowly scoped browser crypto/storage ports.

## Forbidden dependencies

- Apps, domains, web-domains, web-kit, Taro APIs, and deep imports into consumers.

## Public entrypoints

- `@namewta/adapter-axios-browser` root exports adapter/download factories and compatibility error helpers, not a global singleton.

## Backend modules

- `backendModules: []`; domains own endpoint traceability.

## Activation conditions

- Activated in T-04 after current 401, encryption, download, repeat-submit, and Client-header behavior was characterized.

## Validation

- Require factory/interceptor/download unit matrices, real Axios-chain classification probes, structured-error/cause-redaction and callback-failure tests, 401 and encrypted-login E2E, resource cleanup review, lint, typecheck, architecture checks, and App builds.
