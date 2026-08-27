# 多 App 领域架构基线

本文描述当前架构和必须保持的行为边界。

## 认证不变量

- 登录前必须先获取 `/auth/client/context`；`clientEnabled`、`registerEnabled` 只接受精确布尔值，缺失、畸形或请求失败均关闭后续认证动作。
- 每个 App 必须使用显式 ClientId、独立环境变量与会话命名空间，不存在隐式默认 Client。
- 请求加密、Client 请求头、验证码、登录、注册和社交登录能力必须服从服务端 ClientContext。
- 登出和登录态失效必须清理当前 App 的会话，并防止跨 App 会话串用。

## 路由与权限不变量

- Admin 受保护导航按“恢复用户信息、获取菜单、解析所选 Web 领域、`addRoute`、replace 导航”的顺序执行。
- 后端菜单组件键必须解析到当前 App 已选择的 manifest；未知、重复、缺少依赖或未选择能力均失败关闭。
- `v-hasPermi`、`v-hasRoles` 与命令式权限检查使用统一访问评估语义。
- 前端菜单和按钮控制只影响可见性与交互，后端仍是最终授权边界。

## 架构不变量

- `apps/*` 只负责终端组合与交付；App 之间不得互相导入。
- `domains/*` 保持无界面、无 DOM、无浏览器实现；`web-domains/*` 不拥有 App 布局和全局单例。
- 所有工作区内部依赖必须显式声明并从公开 `exports` 导入。
- 产品源码必须位于明确的 App、domain、web-domain、platform、adapter、web-kit 或 tooling 所有权目录。
- 移动 Web、小程序与 Taro 适配器在独立规格激活前保持 README-only。

## 验证基线

根级 `architecture:check`、`architecture:test`、lint、typecheck、test、开发构建和生产构建必须通过。涉及真实登录、菜单、权限或双 App 隔离时，增加对应 Playwright 浏览器验收。
