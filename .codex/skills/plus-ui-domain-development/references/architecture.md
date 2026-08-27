# 架构边界

## 目录职责

| 目录 | 职责 | 不负责 |
|---|---|---|
| `apps/*` | 独立终端入口、ClientContext、布局、品牌、路由装配、运行时适配器、部署 | 可复用业务规则 |
| `packages/domains/*` | 领域模型、服务、映射器、端口、无界面 hooks/utils | Vue 页面、DOM、具体请求库 |
| `packages/web-domains/*` | 对应领域的 Vue 页面、组件、组合式函数、语言资源、清单 | App 布局、全局单例、终端选择 |
| `packages/platform/*` | 跨领域最小合同和组合运行时 | 业务领域模型、浏览器实现 |
| `packages/adapters/*` | HTTP、存储、加密等运行时实现 | 领域策略和页面 |
| `packages/web-kit/*` | 被多个真实消费者证明稳定的 Web 共享机制 | 领域流程、App 品牌 |
| `packages/api-contracts` | OpenAPI 生成的传输合同 | 领域模型和页面模型 |
| `tooling/*` | 架构、OpenAPI、未来脚手架工具 | 产品运行时代码 |

## 依赖方向

```text
apps
  -> web-domains -> domains -> platform
  -> web-kit      -> platform（仅需要时）
  -> adapters     -> platform

api-contracts -> 由 domain 边界映射后使用
tooling       -> 不进入产品运行时
```

领域之间默认不直接依赖。确有共享语义时，先判断它属于某个领域的公开合同，还是足够小且稳定的 `platform` 合同，禁止建立“公共业务大包”。

## 当前组合

- `admin-web`：选择 identity-access、system-admin、workflow、demo、ai、devtools、operations。
- `client-web`：只选择 identity-access、demo。
- `mobile-web`、`miniapp-taro`：仅占位，尚未进入工作区。
- `taro-request`、`taro-storage`：仅占位，尚无依赖和实现。

Admin 的组合入口是 `apps/admin-web/src/router/adminManifestRegistry.ts`，Client 的组合入口是 `apps/client-web/src/composition.ts`。
