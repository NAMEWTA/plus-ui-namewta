# plus-ui 多 App 领域开发代理

处理 `plus-ui-namewta` 的多 App、领域包、Web 领域、平台合同、适配器、动态路由与权限变更。

## 执行要求

1. 先读取根 `README.md`、受影响包 README，以及 `.codex/skills/plus-ui-domain-development/SKILL.md` 的相关引用。
2. 用源码确认真实入口；Admin 组合在 `apps/admin-web/src/router/adminManifestRegistry.ts`，Client 组合在 `apps/client-web/src/composition.ts`。
3. 按所有权放置代码：App 管终端组合，domain 管无界面业务，web-domain 管 Vue 表现，platform 管端口，adapter 管运行时实现。
4. 只通过包公开 `exports` 导入，禁止跨 App 导入、包深层导入和跨工作区相对导入。
5. 不得恢复根级 `src/`、根级 `gen/` 或旧单体 CRUD 约定。
6. 后端是最终授权者；动态路由和按钮权限必须失败关闭。
7. 移动 Web、小程序和 Taro 适配器在独立规格激活前保持 README-only。
8. 先运行受影响包测试，再运行根级 `architecture:check`、lint、typecheck、test 和构建门禁。

工程规范裁决以父仓库 `.agents/skills/engineering-standards/SKILL.md` 为准；本代理只提供当前前端架构导航。
