# NAMEWTA plus-ui

本仓库是 NAMEWTA 的多 App 前端产品仓库。`main` 上的本地 monorepo 是实现权威；上游只读分支 `6.X-Vue` 用于发现新增能力、缺陷修复和安全变化，不要求目录同构。

## 技术栈

- Vue 3、TypeScript 6、Vite 8、Pinia 4、Vue Router、Element Plus。
- pnpm 10 workspace 与 catalog 管理依赖。
- Oxlint、Oxfmt、Vitest、Playwright 和自有架构检查工具负责质量验证。
- Node.js `>=20.19.0`，pnpm `>=10.0.0`；仓库锁定版本见 `packageManager`。

## 当前架构

```text
apps/                    独立终端入口、Client、布局、品牌与组合
packages/domains/        无界面业务领域
packages/web-domains/    领域对应的 Vue Web 表现层
packages/platform/       跨领域端口与组合运行时
packages/adapters/       浏览器及未来终端适配器
packages/web-kit/        经过多消费者验证的 Web 共享机制
packages/api-contracts/  OpenAPI 生成的传输合同
tooling/                 架构、OpenAPI 与未来脚手架工具
```

当前已激活 `admin-web` 与 `client-web`。移动 Web、小程序和 Taro 适配器仅保留中文 README 占位，在独立规格确定技术栈、Client、安全和部署合同前不会成为工作区包。

六个 headless domains 与后端模块一一对应：admin、system、workflow、demo、ai、gen。每个 App 只显式组合需要的 domain/web-domain，可以独立定制布局、样式和 CSS。

包内第二层按 Controller 的稳定 HTTP 资源命名。例如 `SysClientController` 的 `/system/client` 对应 `packages/domains/system/src/client/`，页面对应 `packages/web-domains/system/src/client/`；`SysUserOnlineController` 对应两侧的 `system/src/monitor/online/`。Java 的 `Sys`、`Flw` 等实现前缀不进入目录名，公开使用 package exports，禁止包间深层导入。

详细边界见 [架构基线](docs/architecture-baseline.md)、各目录 README，以及 `.codex/skills/plus-ui-domain-development/SKILL.md`。

## 开发命令

```bash
# 安装锁定依赖
pnpm install --frozen-lockfile

# 启动 Admin Web
pnpm dev

# 架构检查与测试
pnpm architecture:check
pnpm architecture:test

# 工作区质量门禁
pnpm lint
pnpm typecheck
pnpm test

# 开发配置与生产配置构建
pnpm build:dev
pnpm build:prod
```

需要只验证单个包时使用 `pnpm --filter <package-name> <script>`。涉及登录、动态菜单、权限或双 App 隔离的变化还应运行对应 Playwright 流程。

## 维护规则

- 产品变更进入 `main`；`6.X-Vue` 只跟踪上游，不承载本地业务提交。
- 评估上游时按能力映射到本地 owner boundary，记录 `adopt`、`adapt`、`reject` 或 `defer` 以及验证证据，详见 [上游跟踪](docs/upstream/README.md)。
- 只从包的公开 `exports` 导入；禁止跨 App 导入、包深层导入和跨工作区相对导入。
- 根级兼容 `src/` 与旧 `gen/*.ftl` 已删除，不得恢复。
- 前端可见性控制不是安全边界，后端始终负责最终认证和授权。

## 配套后端

后端位于父工作区的独立子仓库 `ruoyi-vue-plus-namewta`，两者通过 HTTP 合同协作并独立开发、测试和发布。