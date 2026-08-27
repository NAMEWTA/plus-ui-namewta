# API Contracts

Private transport types generated from the checked backend OpenAPI snapshot. Domain packages may import schema types from this package, but generated types never replace domain-owned models or use cases.

## Provenance

- Backend repository: `ruoyi-vue-plus-namewta`
- Backend commit: `a98d6edcc591550221dd983e293d43e3aac36d23`
- Runtime endpoint: `/v3/api-docs`
- OpenAPI version: `3.1.0`
- Raw source SHA-256: `d72883b9b089200e92962048ba55f0c003ff20f1527bcd3f3238e39df411bc9e`
- Coverage: 308 paths, 304 schemas, 52 tags
- Generator: `openapi-typescript@7.13.0`

The snapshot was captured from a clean detached backend worktree. The local diagnostic server used the normal `dev` profile with LiteFlow disabled only to bypass its unrelated startup failure; no backend source or production endpoint was changed.

## Commands

Run these from `tooling/openapi`:

```sh
pnpm openapi:fetch -- --source http://127.0.0.1:18080/v3/api-docs --backend-commit a98d6edcc591550221dd983e293d43e3aac36d23
pnpm openapi:generate
pnpm openapi:check
```

`openapi:fetch` validates the complete response before transactionally replacing the snapshot and machine provenance. `openapi:generate` first validates the provenance against the checked snapshot. `openapi:check` repeats that validation, generates in memory, and fails on provenance drift, contract drift, or manual edits without overwriting the committed output.