# Browser Crypto Adapter

## Status

- `active`: `@namewta/adapter-crypto-browser` preserves request encryption and response decryption for the root request facade.

## Responsibilities

- Implement platform crypto ports that preserve request public-key encryption and response decryption, receiving the existing independent key materials through explicit runtime configuration.

## Non-responsibilities

- It does not own login payload semantics, generate/select/rotate/persist key material, hard-code or log key values, transport HTTP, or remove response decryption; browser-delivered material is configuration, not a secret or security boundary.

## Allowed dependencies

- Public platform crypto/configuration contracts, Web Crypto, and approved existing browser-compatible crypto libraries; App/runtime composition injects key values without an adapter-to-App import.

## Forbidden dependencies

- Apps, domains, web-domains, web-kit, Axios request orchestration, Taro APIs, embedded key values, key generation/ownership, and logging of any key material.

## Public entrypoints

- `@namewta/adapter-crypto-browser` root export for explicit crypto adapter factories and result/error contracts.

## Backend modules

- `backendModules: []`; cryptography adapts a transport protocol and owns no backend capability.

## Activation conditions

- Activated in T-04 with parity for current request public-key encryption and response decryption using separately injected materials without assuming they are a pair; removing response decryption requires a separate backend protocol migration outside T-04.

## Validation

- Require request-encryption and response-decryption compatibility vectors, injected/missing/malformed configuration cases, scans proving no key values are embedded or logged, architecture checks, lint, typecheck, and production build.