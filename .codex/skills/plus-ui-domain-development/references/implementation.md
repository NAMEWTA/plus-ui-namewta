# 实现流程

## 新增或迁移一个领域能力

1. 确认唯一后端 Maven 模块、Controller 类和 `@RequestMapping` base path。
2. 如需生成传输类型，在 `packages/api-contracts` 和 `tooling/openapi` 内更新快照与生成结果；不要把生成类型直接当领域模型。
3. 在 `packages/domains/<module>/<resource>` 定义领域模型、映射器、服务和注入端口；`module` 去掉 `ruoyi-` 前缀，`resource` 由 base path 转为 kebab-case。
4. Web 能力放入 `packages/web-domains/<module>/<resource>`，通过类型化运行时端口获取字典、弹窗、下载、导航等宿主能力。
5. 从包根或明确的资源子路径公开导出，禁止 `./*` exports；更新包 README 的职责、后端模块、Controller 映射和验证命令。
6. 在目标 App 的组合入口显式选择；不要让包通过副作用自动注册。
7. 验证未选择的 App 看不到该能力，重复键、缺失领域和未知清单均失败关闭。

## 新增一个 App

新 App 必须拥有独立的包清单、入口、ClientContext、环境变量命名空间、会话存储命名空间、路由组合、布局/主题、构建与部署合同。它只能组合所需领域，不能复制 Admin 全量能力作为起点。

移动 Web 或小程序启用前，要先在独立规格中确定框架版本、目标平台、安全能力、所选领域和不可用的 Web/DOM 依赖。启用时再将 README 占位目录转换为真正的工作区包。

## 质量命令

```bash
pnpm architecture:check
pnpm architecture:test
pnpm lint
pnpm typecheck
pnpm test
pnpm build:dev
pnpm build:prod
```

先运行受影响包的 `--filter` 命令以快速反馈，最终以根级聚合门禁为准。Playwright 需要真实浏览器流程时再运行，且应覆盖所涉及的 App，而不是只验证 Admin。

## 禁止恢复的旧结构

- 根级 `src/**`
- 根级 `gen/*.ftl`
- 假定所有 App 共享同一布局或同一会话键的实现
- 从 `apps/admin-web` 深层导入来构建其他 App
- 为尚未激活的移动端或小程序创建空包清单和虚假构建脚本
- `identity-access`、`system-admin`、`devtools`、`operations` 等旧一级语义包或其兼容门面