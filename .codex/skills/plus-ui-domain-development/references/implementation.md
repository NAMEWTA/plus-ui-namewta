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

Client Web、移动 Web 或小程序启用前，要先在独立规格中确定框架版本、目标平台、安全能力、所选领域和不可用的 Web/DOM 依赖。启用时再将 README 占位目录转换为真正的工作区包。

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

## 组合约束

- 每个 App 独立拥有布局、ClientContext 和会话命名空间。
- App 之间不互相导入，所有共享能力从工作区包公开入口组合。
- Client Web、移动端和小程序在激活前只保留中文 README，不创建包清单和构建脚本。
- domain 一级目录只使用后端模块名，二级资源目录只使用稳定 Controller base path。
