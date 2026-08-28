---
name: plus-ui-domain-development
description: 为 NAMEWTA plus-ui 多 App 领域架构提供实现导航。处理 apps、domains、web-domains、platform、adapters、web-kit、App 显式组合、动态菜单路由、按钮权限、OpenAPI 合同或新增终端时使用。
---

# plus-ui 多 App 领域开发

本 Skill 描述 `plus-ui-namewta` 当前架构和源码入口。强制规范与质量门禁由父仓库的 `engineering-standards` 裁决。

## 工作流程

1. 先判断变更归属：终端交付归 `apps`，无界面业务规则归 `domains`，Vue 页面归 `web-domains`，跨域端口归 `platform`，运行时实现归 `adapters`，已被多个消费者证明稳定的 Web 机制归 `web-kit`。
2. 先由后端 Maven 模块确定一级包名，再由 Controller base path 确定 kebab-case 资源目录；不得使用自定义业务别名替代后端模块名。
3. 按任务读取一份或多份引用：
   - 架构边界与依赖方向：[architecture.md](references/architecture.md)
   - 新增能力和终端的实现顺序：[implementation.md](references/implementation.md)
   - 动态路由、菜单和权限：[routing-permissions.md](references/routing-permissions.md)
4. 只从包的 `exports` 公开入口导入，禁止深层导入、跨包相对导入和 App 之间互相导入。
5. App 必须在编译期显式选择领域和 Web 领域；未选择、重复注册或缺少依赖必须失败关闭。
6. 修改后运行与风险相匹配的包级测试，再运行根级架构、类型、测试和构建门禁。

## 硬边界

- `packages/domains/*` 不依赖 Vue、DOM、浏览器存储或具体请求实现。
- `packages/web-domains/*` 不拥有 App 布局、全局路由器、请求单例或后端授权。
- `apps/*` 拥有 ClientContext、布局、品牌、路由装配、运行时适配器和部署配置。
- 服务端菜单纯投影归 `packages/platform/app-runtime`，Vue 权限指令宿主归 `packages/web-kit/permission`，导航状态归各 App 自有 Store。
- 后端仍是最终授权者；前端路由和按钮权限只负责可见性与交互失败关闭。
- 移动 Web、小程序和 Taro 适配器在独立规格激活前保持仅含中文 README 的占位目录。
- domain 固定为 `admin/system/gen/workflow/demo/ai`；监控属于 `system/monitor/*`。

## 事实优先级

发生冲突时依次读取：当前源码与 `package.json`、各包 README、`tooling/architecture` 检查、父仓库工程规范。本 Skill 不替代源码确认。