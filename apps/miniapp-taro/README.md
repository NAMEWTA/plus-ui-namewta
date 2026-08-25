# Taro Miniapp Application

## Status
- `placeholder`: Taro is not installed or version-pinned and this directory is not a package.
## Responsibilities
- Reserve a future miniapp composition that reuses headless domains through Taro runtime adapters and its own presentation layer.
## Non-responsibilities
- It does not implement a miniapp, select a target platform, or reuse Vue Web domains and Element Plus UI.
## Allowed dependencies
- After a dedicated Spec, public platform/domain entries and activated Taro request/storage adapters.
## Forbidden dependencies
- `web-domains`, Element Plus `web-kit`, browser-only adapters, other Apps, and deep imports.
## Public entrypoints
- None; a future terminal Spec must define Taro configuration, App entry, and composition manifest.
## Backend modules
- `backendModules: []`; future selected domains must provide explicit backend traceability.
## Activation conditions
- Activate only for a real miniapp requirement with an approved Taro/version/platform decision and independent Client/security contract.
## Validation
- Before activation, scan for README-only content and no manifest; after activation, require Taro build/tests and proof of no Web/DOM dependency.
