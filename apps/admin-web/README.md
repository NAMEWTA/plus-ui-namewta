# Admin Web Application

## Status
- `placeholder`: the existing root `src/` remains the compatibility entry; this App is not buildable yet.
## Responsibilities
- Eventually compose all seven Web domains, the Element shell, browser adapters, admin ClientContext, layout, theme, and deployment settings.
## Non-responsibilities
- It will not own reusable domain services, shared adapter implementations, or backend authorization rules.
## Allowed dependencies
- Public entries of selected platform, domain, web-domain, web-kit, and browser-adapter packages.
## Forbidden dependencies
- Other Apps, package internals, Taro adapters, and direct imports from the legacy root once compatibility removal is approved.
## Public entrypoints
- Future App-owned `src/main.ts` and App Composition Manifest; no entrypoint exists while placeholder.
## Backend modules
- `backendModules: [ruoyi-admin, ruoyi-system, ruoyi-workflow, ruoyi-ai, ruoyi-demo, ruoyi-gen, ruoyi-job]` through selected domains.
## Activation conditions
- Activate only after workspace setup and verified domain manifests can preserve current admin behavior; remove the root compatibility entry only at Wave 10 Gate F.
## Validation
- When activated, run independent lint, typecheck, unit, Playwright, and production build gates plus composition and Client-menu checks.
