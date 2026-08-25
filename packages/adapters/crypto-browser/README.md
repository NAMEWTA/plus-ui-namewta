# Browser Crypto Adapter

## Status
- `placeholder`: current browser request encryption implementation remains active.
## Responsibilities
- Implement platform crypto ports for request encryption/decryption primitives using browser-compatible cryptography.
## Non-responsibilities
- It does not own login payload semantics, embed secrets, choose backend keys, transport HTTP, or implement Taro crypto.
## Allowed dependencies
- Public platform crypto contracts, Web Crypto, and approved existing browser-compatible crypto libraries.
## Forbidden dependencies
- Apps, domains, web-domains, web-kit, Axios request orchestration, Taro APIs, and private key material.
## Public entrypoints
- Future `@namewta/adapter-crypto-browser` root export for explicit crypto adapter factories and result/error contracts.
## Backend modules
- `backendModules: []`; cryptography adapts a transport protocol and owns no backend capability.
## Activation conditions
- Activate in T-04 after production public-key/header behavior and failure cases are characterized without assuming request/response key pairing.
## Validation
- Require crypto boundary vectors, encrypted-request integration, secret/key-material review, lint, typecheck, architecture checks, and production build.
