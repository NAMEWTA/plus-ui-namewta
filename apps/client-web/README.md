# Client Web Application

## Status
- `placeholder`: no package manifest, source, Client configuration, or build target exists.
## Responsibilities
- Prove a second Web App can compose identity-access and demo with an independent ClientContext, shell, theme, and deployment.
## Non-responsibilities
- It is not a reduced admin clone and does not automatically include system administration, workflow, AI, devtools, or operations.
## Allowed dependencies
- Public entries for identity-access, demo, Web shell/UI, platform contracts, and browser adapters selected by its composition manifest.
## Forbidden dependencies
- Admin App internals, unselected domains, deep imports, and global fallback Client configuration.
## Public entrypoints
- Future App-owned `src/main.ts` and client composition manifest; no entrypoint exists while placeholder.
## Backend modules
- `backendModules: [ruoyi-admin, ruoyi-system, ruoyi-demo]` for authentication, current-session/menu context, and demo capabilities.
## Activation conditions
- Activate at the second-App proof only with a distinct OAuth clientId and service menus aligned to its selected component keys.
## Validation
- Require independent build/E2E, multi-Client session isolation, selected-only manifest registration, and no App reverse dependency from shared packages.
